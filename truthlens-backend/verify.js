import axios from "axios";
import fs from "fs";
import { exec } from "child_process";

import { scrapeArticle } from "./scraper.js";
import { searchGoogle } from "./serper.js";

/* ================= CLEAN TEXT ================= */

const cleanText = (text) => {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/Subscribe Now.*?Read More/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 1500);
};

/* ================= TESSERACT OCR ================= */

const extractTextFromImage = (filePath) => {
  return new Promise((resolve) => {
    exec(`tesseract ${filePath} stdout`, (err, stdout) => {
      if (err) return resolve("");
      resolve(cleanText(stdout));
    });
  });
};

/* ================= CLAIM EXTRACTION ================= */

const extractClaims = async (text) => {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Extract 3 short factual claims.
Return ONLY JSON array.
`,
        },
        { role: "user", content: text },
      ],
    },
    {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    }
  );

  try {
    return JSON.parse(res.data.choices[0].message.content);
  } catch {
    return [text];
  }
};

/* ================= FILTER SOURCES ================= */

const isTrusted = (url) => {
  return (
    url.includes("bbc") ||
    url.includes("reuters") ||
    url.includes("cnn") ||
    url.includes("ndtv") ||
    url.includes("cbsnews")
  );
};

/* ================= ANALYSIS ================= */

const analyze = async (text, claims, sources) => {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are TruthLens AI.

Return ONLY JSON:
{
 truth_score: number,
 verdict: "Real" | "Fake" | "Misleading",
 explanation: simple human explanation,
 claim_analysis: [
  { claim, status, reason }
 ],
 trusted_sources: []
}
`,
        },
        {
          role: "user",
          content: `
TEXT: ${text}
CLAIMS: ${JSON.stringify(claims)}
SOURCES: ${JSON.stringify(sources)}
`,
        },
      ],
    },
    {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    }
  );

  let raw = res.data.choices[0].message.content;

  raw = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    return {
      truth_score: 50,
      verdict: "Uncertain",
      explanation: raw,
      claim_analysis: [],
      trusted_sources: [],
    };
  }
};

/* ================= MAIN ================= */

export const verifyNews = async (body, file) => {
  let { text, link, type } = body;
  let content = text || "";

  if (link) {
    content = await scrapeArticle(link);
    content = cleanText(content);
  }

  if (file && type === "image") {
    content = await extractTextFromImage(file.path);
  }

  if (!content) throw new Error("No content");

  const claims = await extractClaims(content);

  let sources = [];

  for (let claim of claims) {
    const results = await searchGoogle(claim);

    for (let r of results) {
      if (!isTrusted(r.link)) continue;

      const article = await scrapeArticle(r.link);

      sources.push({
        title: r.title,
        link: r.link,
        content: cleanText(article),
      });
    }
  }

  const analysis = await analyze(content, claims, sources);

  return {
    cleaned_text: content,
    claims,
    sources,
    analysis,
  };
};
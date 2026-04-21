import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeArticle = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(data);

    let text = "";

    $("article p, p").each((i, el) => {
      text += $(el).text() + " ";
    });

    return text;
  } catch {
    return "";
  }
};
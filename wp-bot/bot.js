require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadMediaMessage
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const BACKEND_URL = process.env.BACKEND_URL;
const WEBSITE_LINK = process.env.WEBSITE_LINK;

const sessions = new Map();
const cooldown = new Map();

/* 🔥 EXPRESS SERVER (FOR RENDER FREE) */
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

/* ================= UI ================= */

const menu = () => `
Choose what you'd like to do :

1️⃣ Verify News  
2️⃣ Detect Deepfake  
3️⃣ Exit

Reply with 1,2 or 3.
`;

const welcomeMsg = () => `
👋 *Hello — I’m Luna*

AI assistant behind *TruthLens*

I help you:
• Verify News & claims 
• Detect Deepfakes  
• Explain results clearly

🌐 ${WEBSITE_LINK}

${menu()}
`;

/* ================= BOT ================= */

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    browser: ["Luna", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("Scan QR:");
      qrcode.generate(qr, { small: true });

      console.log("\nOpen QR link:\n");
      console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}`);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        setTimeout(startBot, 3000);
      }
    }

    if (connection === "open") {
      console.log("✅ Bot Connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;

    const now = Date.now();
    if (cooldown.get(jid) > now) return;
    cooldown.set(jid, now + 1000);

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    const lower = text?.toLowerCase();

    try {
      /* START */
      if (lower?.includes("hello luna")) {
        sessions.set(jid, { active: true, mode: null });
        return sock.sendMessage(jid, { text: welcomeMsg() });
      }

      const session = sessions.get(jid);
      if (!session) return;

      /* EXIT */
      if (text === "3" || lower === "exit") {
        sessions.delete(jid);
        return sock.sendMessage(jid, {
          text: "👋 Session ended.\nHave a Good Day ahead 😊 !!.\n\nType *Hello Luna* to restart."
        });
      }

      /* MENU */
      if (text === "1") {
        session.mode = "news";
        return sock.sendMessage(jid, {
          text: "📰 Send text or link to verify."
        });
      }

      if (text === "2") {
        session.mode = "deepfake";
        return sock.sendMessage(jid, {
          text: "🖼️ Send image or video."
        });
      }

      if (!session.mode) {
        return sock.sendMessage(jid, { text: menu() });
      }

      /* ================= NEWS ================= */
      if (session.mode === "news" && text) {
        await sock.sendMessage(jid, { text: "🔍 Analyzing..." });

        console.log("Sending to backend:", text);

        const res = await axios.post(
          `${BACKEND_URL}/verify`,
          { text, userId: jid },
          { timeout: 60000 } // 🔥 IMPORTANT FIX
        );

        console.log("Response:", res.data);

        // 🔥 FIXED (NO .analysis)
        const a = res.data;

        await sock.sendMessage(jid, {
          text: `📰 *TruthLens Analysis*

📊 Trust Score: ${Math.round(a.truth_score * 100)}%

🔎 Verdict: ${a.verdict}

🧠 ${a.explanation}`
        });

        session.mode = null;
        return sock.sendMessage(jid, { text: menu() });
      }

      /* ================= DEEPFAKE ================= */
      if (session.mode === "deepfake") {
        await sock.sendMessage(jid, { text: "🔍 Analyzing media..." });

        const buffer = await downloadMediaMessage(msg, "buffer", {}, {});
        const path = `./temp/${Date.now()}.jpg`;

        fs.writeFileSync(path, buffer);

        const form = new FormData();
        form.append("file", fs.createReadStream(path));
        form.append("userId", jid); // 🔥 important

        const res = await axios.post(
          `${BACKEND_URL}/deepfake`,
          form,
          {
            headers: form.getHeaders(),
            timeout: 60000
          }
        );

        fs.unlinkSync(path);

        await sock.sendMessage(jid, {
          text: `🖼️ *Deepfake Analysis*

🧠 ${res.data.explanation}`
        });

        session.mode = null;
        return sock.sendMessage(jid, { text: menu() });
      }

    } catch (err) {
      console.log("FULL ERROR:", err?.response?.data || err.message);

      await sock.sendMessage(jid, {
        text: `❌ Error:
${err?.response?.data?.error || err.message}`
      });
    }
  });
}

startBot();
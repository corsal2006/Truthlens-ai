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

const BACKEND_URL = "https://truthlens-backendd.onrender.com";
const WEBSITE_LINK = "https://truthlens-ai-tan.vercel.app/";

const sessions = new Map();
const cooldown = new Map();

/* ================= HELPERS ================= */

function formatPercent(value) {
    if (!value) return "0%";
    return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
}

function menuText() {
    return `───────────────
Choose what you'd like to do:

① Verify News (text or link)  
② Detect Deepfake (image or video)  
③ Exit  

Reply with *1*, *2* or *3*.`;
}

function isURL(text) {
    return /(https?:\/\/[^\s]+)/g.test(text);
}

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
    console.log("📱 Scan QR:");

    // Terminal QR (small)
    qrcode.generate(qr, { small: true });

    // 🔥 NEW: clickable QR link
    console.log("\n👉 Open this link to scan easily:\n");
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}\n`);
}

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code !== DisconnectReason.loggedOut) {
                setTimeout(startBot, 3000);
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message) return;
        if (msg.key.fromMe) return;

        const jid = msg.key.remoteJid;

        const now = Date.now();
        if (cooldown.get(jid) > now) return;
        cooldown.set(jid, now + 1200);

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const lower = text?.toLowerCase();

        try {

            /* ================= ACTIVATE ================= */
            if (lower && lower.includes("hello luna")) {
                sessions.set(jid, { active: true, mode: null });

                await sock.sendMessage(jid, {
                    text: `👋 *Hello — I’m Luna*

The AI assistant behind *TruthLens*.

I help you:
• Verify news & claims  
• Detect deepfake media  
• Explain results clearly  

🌐 Try our full platform:
${WEBSITE_LINK}

${menuText()}`
                });
                return;
            }

            const session = sessions.get(jid);
            if (!session?.active) return;

            /* ================= EXIT ================= */
            if (lower === "exit" || text === "3") {
                sessions.delete(jid);

                await sock.sendMessage(jid, {
                    text: `👋 Session closed.

Stay informed, stay aware.
Have a great day ahead ✨

🌐 Explore our website:
${WEBSITE_LINK}

Type *Hello Luna* anytime to start again.`
                });
                return;
            }

            /* ================= MENU ================= */
            if (text === "1") {
                session.mode = "news";
                await sock.sendMessage(jid, {
                    text: `📰 *News Verification*

Send any text or link and I’ll analyze its authenticity using AI.`
                });
                return;
            }

            if (text === "2") {
                session.mode = "deepfake";
                await sock.sendMessage(jid, {
                    text: `🖼️ *Deepfake Detection*

Send an image or video and I’ll analyze if it has been manipulated.`
                });
                return;
            }

            if (!session.mode) {
                await sock.sendMessage(jid, {
                    text: `⚠️ Please select a valid option.\n\n${menuText()}`
                });
                return;
            }

            await sock.sendPresenceUpdate("composing", jid);

            /* ================= NEWS ================= */
            if (session.mode === "news" && text) {
                await sock.sendMessage(jid, { text: "🔍 Analyzing content..." });

                const payload = isURL(text)
                    ? { link: text, userId: jid }
                    : { text, userId: jid };

                const res = await axios.post(`${BACKEND_URL}/verify`, payload);

                const analysis = res.data.analysis || {};

                await sock.sendMessage(jid, {
                    text: `📰 *TruthLens Analysis*

📊 Trust Score: ${formatPercent(analysis.truth_score)}

🔎 Verdict: ${analysis.verdict || "Unknown"}

🧠 Explanation:
${analysis.explanation || "No explanation available"}`
                });

                session.mode = null;
                await sock.sendMessage(jid, { text: menuText() });
                return;
            }

            /* ================= DEEPFAKE ================= */
            if (
                session.mode === "deepfake" &&
                (msg.message.imageMessage || msg.message.videoMessage)
            ) {
                await sock.sendMessage(jid, {
                    text: "🔍 Analyzing media..."
                });

                const buffer = await downloadMediaMessage(msg, "buffer", {}, {});

                const isVideo = !!msg.message.videoMessage;
                const filePath = `./temp_${Date.now()}${isVideo ? ".mp4" : ".jpg"}`;

                fs.writeFileSync(filePath, buffer);

                const form = new FormData();
                form.append("file", fs.createReadStream(filePath), {
                    contentType: isVideo ? "video/mp4" : "image/jpeg"
                });

                const res = await axios.post(
                    `${BACKEND_URL}/deepfake`,
                    form,
                    { headers: form.getHeaders() }
                );

                fs.unlinkSync(filePath);

                const d = res.data;

                await sock.sendMessage(jid, {
                    text: `🖼️ *Deepfake Analysis*

🧠 ${d.explanation || "No explanation available"}`
                });

                session.mode = null;
                await sock.sendMessage(jid, { text: menuText() });
                return;
            }

        } catch (err) {
            console.log("❌ ERROR:", err.response?.data || err.message);

            await sock.sendMessage(jid, {
                text: "⚠️ Something went wrong while processing your request."
            });
        }
    });
}

startBot();
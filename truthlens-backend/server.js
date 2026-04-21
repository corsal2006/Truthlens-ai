import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import { verifyNews } from "./verify.js";
import { detectDeepfake } from "./deepfake.js";

import { Storage } from "@google-cloud/storage";
import admin from "firebase-admin";


dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

/* ================= FIREBASE SETUP ================= */

admin.initializeApp({
  credential: admin.credential.cert("./serviceAccount.json")
});

const db = admin.firestore();
app.get("/api/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db
      .collection("analysis")
      .where("userId", "==", userId)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,        // 🔥 THIS IS IMPORTANT
      ...doc.data()
    }));

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
app.delete("/api/history/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("analysis").doc(id).delete(); // 🔥 delete using doc.id

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= VERIFY NEWS ================= */

app.post("/verify", upload.single("file"), async (req, res) => {
  try {
    console.log("🔥 VERIFY HIT");
    console.log("BODY:", req.body);

    const result = await verifyNews(req.body, req.file);

    try {
      console.log("🔥 TRYING TO SAVE...");

      await db.collection("analysis").add({
  userId: req.body.userId || "demo-user", // ✅ MUST BE HERE
  type: "text",
  input: req.body.text || req.body.link || "file",
  result: result,
  createdAt: new Date()
});

      console.log("✅ SAVED SUCCESSFULLY");

    } catch (err) {
      console.log("❌ SAVE FAILED:", err.message);
    }

    res.json(result);

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= DEEPFAKE ================= */

app.post("/deepfake", upload.single("file"), async (req, res) => {
  try {
    const result = await detectDeepfake(req.file);

    // ✅ SAFE SAVE
    try {
      await db.collection("analysis").add({
  userId: req.body.userId || "demo-user", // ✅ MUST BE HERE
  type: "deepfake",
  input: req.file?.originalname || "file",
  result: result,
  createdAt: new Date()
});
      console.log("✅ Deepfake Saved");
    } catch (dbErr) {
      console.error("⚠️ Firestore Save Failed:", dbErr.message);
    }

    res.json(result);
  } catch (err) {
    console.error("❌ Deepfake Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= HISTORY API ================= */

app.get("/api/history/:userId", async (req, res) => {
  try {
    const snapshot = await db
      .collection("analysis")
      .where("userId", "==", req.params.userId)
      .orderBy("createdAt", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SERVER ================= */

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
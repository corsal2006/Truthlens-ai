import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

const extractFrame = (videoPath, outputImage) =>
  new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({ count: 1, filename: outputImage })
      .on("end", resolve)
      .on("error", reject);
  });

export const detectDeepfake = async (file) => {
  let path = file.path;

  if (file.mimetype.startsWith("video")) {
    const frame = file.path + ".jpg";
    await extractFrame(file.path, frame);
    path = frame;
  }

  const form = new FormData();
  form.append("media", fs.createReadStream(path));
  form.append("models", "genai");

  const res = await axios.post(
    "https://api.sightengine.com/1.0/check.json",
    form,
    {
      params: {
        api_user: process.env.SIGHTENGINE_API_USER,
        api_secret: process.env.SIGHTENGINE_API_SECRET,
      },
      headers: form.getHeaders(),
    }
  );

  const score = res.data.type?.ai_generated || 0;

  return {
    score,
    verdict: score > 0.6 ? "AI Generated" : "Likely Real",
    explanation:
      score > 0.6
        ? "High probability of AI generation based on visual inconsistencies."
        : "No strong indicators of AI generation detected.",
  };
};
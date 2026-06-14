import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("LaughRoast backend running 🚀");
});

app.post("/api/roast", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ roast: ["Name dao na 😂"] });
  }

  try {
    // ===================================
    // 1️⃣ ROAST GENERATION (টেক্সট পার্ট)
    // ===================================
    // মডেলের নাম 'gemini-2.5-flash' দিয়ে ট্রাই করুন, এটি নতুন SDK-র জন্য বেস্ট
    const roastResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `তুমি একজন চরম লেভেলের ট্রোলার এবং রোস্ট মাস্টার। তোমার কাজ হলো "${name}" নামের একজন মানুষকে নিয়ে ৩ লাইনের মারাত্মক ফানি ও সার্কাস্টিক রোস্ট তৈরি করা।

নিয়মাবলী:
- সম্পূর্ণ বাংলা ভাষায় (Bengali Language) লিখতে হবে।
- ভাষা হবে একদম খাঁটি ফেসবুক মিম স্টাইল এবং বন্ধুদের আড্ডার মতো হাস্যকর।
- কোনো নোংরা গালি বা হেট স্পিচ দেওয়া যাবে না, কিন্তু ট্রোলটা যেন চরম হাসির হয়।
- প্রতিটা লাইনে ফানি ইমোজি ব্যবহার করো 😂🔥💀
- ঠিক ৩টি আলাদা লাইন তৈরি করবে।`,
    });

    const roastText = roastResult.text ?? "";
    const roasts = roastText
      .split("\n")
      .map((r) => r.replace(/^\d+\.\s*|-\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    // ===================================
    // 2️⃣ IMAGE GENERATION (আলাদা ট্রাই-ক্যাচ)
    // ===================================
    let imageUrl = null;

    try {
      const imagePrompt = `A funny meme caricature image for ${name}, high contrast, 4:3 aspect ratio, no text.`;

      const imageResult = await ai.models.generateImages({
        model: "imagen-3.0-generate-001",
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "4:3",
        },
      });

      const rawImage = imageResult.generatedImages?.[0]?.image;
      const imageBase64 = typeof rawImage === 'string' ? rawImage : rawImage?.imageBytes;

      if (imageBase64) {
        imageUrl = `data:image/png;base64,${imageBase64}`;
      }
    } catch (imgErr) {
      // ইমেজ জেনারেট না হলে কনসোলে এরর দেখাবে, কিন্তু পুরো রিকোয়েস্ট ক্র্যাশ করবে না
      const message = imgErr instanceof Error ? imgErr.message : String(imgErr);
      console.error("Imagen failed, skipping image component:", message);
    }

    // রেসপন্স পাঠানো হচ্ছে (ইমেজ না থাকলে null যাবে, কিন্তু রোস্ট টেক্সট যাবেই)
    res.json({
      roast: roasts,
      image: imageUrl,
    });

  } catch (err) {
    // টেক্সট জেনারেশন বা অন্য বড় কোনো সমস্যা হলে এখানে আসবে
    console.error("Main Roast Error:", err);
    res.status(500).json({
      roast: ["AI failed to think! 😭", "Check your API key or Model Name."],
      image: null,
    });
  }
});

export default app;
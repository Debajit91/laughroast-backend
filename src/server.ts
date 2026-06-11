import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LaughRoast backend running 🚀");
});

app.post("/api/roast", async (req, res) => {
  const { name }: { name: string } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a funny roast generator AI.
Generate a short, friendly, humorous roast about this person: ${name}.
Keep it light, social-media friendly, and not offensive.`
              }
            ]
          }
        ]
      }
    );

    const roast =
      response.data.candidates[0].content.parts[0].text;

    res.json({ roast });
  } catch (error) {
    res.status(500).json({ error: "Gemini AI failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
import express from "express";
import cors from "cors";
import { memeBank } from "./memeBank";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LaughRoast backend running 🚀");
});

app.post("/api/roast", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.json({ roast: ["Name dao na 😂"] });
  }

  const shuffled = memeBank
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const roasts = shuffled.map(
    (meme: string) => `${name} → ${meme}`
  );

  res.json({ roast: roasts });
});

export default app;
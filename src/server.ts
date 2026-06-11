import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { memeBank } from "./memeBank";

dotenv.config();

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
        (meme) => `${name} → ${meme}`
    );

    res.json({ roast: roasts });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
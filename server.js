import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Get API key from .env
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("❌ Missing OpenAI API Key! Check your .env file.");
    process.exit(1); // Exit if no API key is provided
}

const openai = new OpenAI({ apiKey });

// AI harm detection endpoint
app.post("/analyze-text", async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ result: "⚠️ Error: No input provided." });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an AI content moderator. Detect and warn users about hate speech, misinformation, and cyberbullying." },
                { role: "user", content: `Analyze the following text for harmful content: "${text}"` },
            ],
            temperature: 0.2,
        });

        if (response?.choices?.length > 0) {
            res.json({ result: response.choices[0].message.content });
        } else {
            res.status(500).json({ result: "⚠️ Error: Invalid response from AI." });
        }
    } catch (error) {
        console.error("❌ API Error:", error);

        if (error.response?.status === 401) {
            res.status(401).json({ result: "⚠️ Invalid OpenAI API key. Check your .env file." });
        } else if (error.response?.status === 429) {
            res.status(429).json({ result: "⚠️ Error: Quota exceeded. Please check your plan and billing details." });
        } else if (error.code === "model_not_found") {
            res.status(404).json({ result: "⚠️ Error: Model `gpt-3.5-turbo` is unavailable." });
        } else {
            res.status(500).json({ result: "⚠️ Error: Unable to analyze text." });
        }
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

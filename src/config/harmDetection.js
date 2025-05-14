import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "your-openai-api-key", // Replace with your OpenAI API key
    dangerouslyAllowBrowser: true, // Required for client-side API calls
});

const analyzeText = async (text) => {
    try {
        if (!text.trim()) {
            return "⚠️ Error: No input provided.";
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an AI content moderator. Detect and warn users about hate speech, misinformation, and cyberbullying." },
                { role: "user", content: `Analyze the following text for harmful content: "${text}". Provide a clear warning if harmful, otherwise confirm it's safe.` },
            ],
            temperature: 0.2,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error analyzing text:", error);
        return "⚠️ Error: Unable to analyze text at the moment.";
    }
};

export default analyzeText;

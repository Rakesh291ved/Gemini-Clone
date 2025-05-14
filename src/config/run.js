const analyzeText = async (text) => {
    try {
        const response = await fetch("http://localhost:5000/analyze-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Error: Unable to analyze text.";
    }
};

export default analyzeText;

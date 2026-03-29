import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Enable CORS so your frontend can call this backend
app.use(cors());
app.use(express.json());

// AI endpoint
app.post("/ai", async (req, res) => {
  try {
    const { resume, job } = req.body;

    // Log incoming request
    console.log("Received request:", { resume, job });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Safe and widely available
        messages: [
          {
            role: "system",
            content: "You are a professional resume coach giving concise, actionable suggestions."
          },
          {
            role: "user",
            content: `Resume:\n${resume}\n\nJob Description:\n${job}\n\nGive 5 specific actionable suggestions.`
          }
        ],
        temperature: 0.7
      })
    });

    // Check for OpenAI API errors
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const data = await response.json();
    console.log("Raw OpenAI response:", JSON.stringify(data, null, 2));

    // Normalize response for frontend
    const aiMessage = data.choices?.[0]?.message?.content || "No suggestions returned";
    res.json({ choices: [{ message: { content: aiMessage } }] });

  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "AI backend error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI backend running on port ${PORT}`));

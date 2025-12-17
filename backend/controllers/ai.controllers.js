import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const aiChat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });

    const prompt = `
You are a helpful AI assistant for a student discussion forum.
Answer clearly, simply, and in short practical steps when needed.

Question: ${question}
`;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const answer = response.text();

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini AI Error:", error);

    return res.status(500).json({
      message: "AI chat error",
      error: error.message,
    });
  }
};

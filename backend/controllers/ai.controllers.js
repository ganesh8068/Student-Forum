import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI;
if (apiKey) {
  genAI = new GoogleGenerativeAI({ apiKey });
}

// Local fallback questions and answers when the AI service is unavailable.
const FALLBACK_QA = [
  {
    question: "what is node.js?",
    answer:
      "Node.js is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript on the server.",
  },
  {
    question: "how to reset my password?",
    answer:
      "Use the 'Forgot Password' link on the sign-in page to receive password reset instructions via email.",
  },
  {
    question: "how to create a post?",
    answer:
      "Click the 'New Post' button, enter a title and content, then submit. Add tags to make it easier to find.",
  },
];

function findFallbackAnswer(question) {
  if (!question) return null;
  const q = question.trim().toLowerCase();
  // Exact match first
  const exact = FALLBACK_QA.find((item) => item.question === q);
  if (exact) return exact.answer;
  // Keyword match
  for (const item of FALLBACK_QA) {
    const keywords = item.question.split(/\W+/).filter(Boolean);
    if (keywords.every((kw) => q.includes(kw))) return item.answer;
  }
  return null;
}

export const aiChat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }
    if (!genAI) {
      console.warn(
        "Gemini AI not configured — using fallback answers if available."
      );
      const fallback = findFallbackAnswer(question);
      if (fallback)
        return res.status(200).json({ answer: fallback, fallback: true });
      return res.status(500).json({ message: "AI service not configured" });
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

    // Try several common response shapes from SDKs and fall back to inspect
    let answer = null;
    try {
      if (result?.response?.text) answer = result.response.text();
      else if (result?.candidates && result.candidates[0])
        answer =
          result.candidates[0].content?.[0]?.text || result.candidates[0].text;
      else if (result?.output && result.output[0])
        answer = result.output[0].content?.[0]?.text || result.output[0].text;
      else if (typeof result === "string") answer = result;
    } catch (parseErr) {
      console.error("Gemini parse error:", parseErr);
    }

    if (!answer) {
      console.error("Gemini raw result:", JSON.stringify(result));
      // Try fallback before failing
      const fallback = findFallbackAnswer(question);
      if (fallback)
        return res.status(200).json({ answer: fallback, fallback: true });
      return res
        .status(500)
        .json({ message: "AI returned unexpected response shape" });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini AI Error:", error);

    // On error, attempt fallback answers before returning an error
    const fallback = findFallbackAnswer(req.body?.question);
    if (fallback)
      return res.status(200).json({ answer: fallback, fallback: true });

    return res.status(500).json({
      message: "AI chat error",
      error: error.message,
    });
  }
};

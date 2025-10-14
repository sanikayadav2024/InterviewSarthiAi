import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/utils/db";
import { dailyquestion } from "@/utils/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { prompt, company, role, experience } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Save in Neon DB (optional)
  await db.insert(dailyquestion).values({
    question: prompt,
    answer: text,
    category: company,
    difficulty: experience,
    createdby: "Gemini AI",
  });

  return Response.json({ success: true, questions: text });
}

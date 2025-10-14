import { db } from "@/utils/db";
import { DailyQuestion } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { chatSession } from "@/utils/GeminiAIModal";

export async function getDailyQuestion() {
  const today = new Date().toISOString().split("T")[0];

  // Check today's question
  const existing = await db
    .select()
    .from(DailyQuestion)
    .where(eq(DailyQuestion.questionDate, today)); // use lowercase

  if (existing.length > 0) return existing[0];

  // Generate new question
  const prompt = `Generate a coding interview question with its answer, category, and difficulty. JSON format: { "question": "...", "answer": "...", "category": "...", "difficulty": "Easy/Medium/Hard" }`;

  const response = await chatSession.sendMessage(prompt);
  const rawText = response.response.text();

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      data = JSON.parse(match[0]);
    } else {
      console.error("Gemini response not valid JSON:", rawText);
      throw new Error("Failed to parse Gemini response");
    }
  }

  // Insert safely
  let inserted;
  try {
    inserted = await db
      .insert(DailyQuestion)
      .values({
        question: data.question,
        answer: data.answer,
        category: data.category,
        difficulty: data.difficulty,
        createdBy: "Gemini AI", // lowercase
        questionDate: today,
      })
      .returning();
  } catch (err) {
    if (err.code === "23505") { // duplicate key
      // another request already inserted today's question
      const todayQuestion = await db
        .select()
        .from(DailyQuestion)
        .where(eq(DailyQuestion.questionDate, today));
      return todayQuestion[0];
    }
    throw err;
  }

  return inserted[0];
}

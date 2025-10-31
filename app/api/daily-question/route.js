import { NextResponse } from "next/server";
import { db } from "@/utils/db"; 
import { DailyQuestion } from "@/utils/schema"; 
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function GET() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    // 1️⃣ Check if today's question already exists
    const existing = await db
      .select()
      .from(DailyQuestion)
      .where(eq(DailyQuestion.questionDate, today));

    if (existing.length > 0) {
      return NextResponse.json(existing[0]);
    }

    // 2️⃣ Generate new question using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Generate a coding interview style easy daily challenge with:
- question
- answer
- category (DSA/Algo/System Design/etc.)
- difficulty (Easy, Medium, Hard)
Respond strictly in JSON format:
{
  "question": "...",
  "answer": "...",
  "category": "...",
  "difficulty": "..."
}`;

    const result = await model.generateContent(prompt);

    // 3️⃣ Await response text
    const raw = await result.response.text();

    // 4️⃣ Parse AI response safely
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse Gemini JSON");
      parsed = JSON.parse(match[0]);
    }

    // 5️⃣ Insert into DB
    const inserted = await db
      .insert(DailyQuestion)
      .values({
        question: parsed.question,
        answer: parsed.answer,
        category: parsed.category,
        difficulty: parsed.difficulty,
        createdBy: "Gemini AI",
        questionDate: today,
      })
      .returning();

    return NextResponse.json(inserted[0]);

  } catch (err) {
    console.error("Error in /api/daily-question:", err);

    // 6️⃣ Handle duplicate key gracefully (if multiple requests run simultaneously)
    if (err.code === "23505") { // Postgres unique violation
      const existing = await db
        .select()
        .from(DailyQuestion)
        .where(eq(DailyQuestion.questionDate, today));
      return NextResponse.json(existing[0]);
    }

    return NextResponse.json(
      { error: "Failed to fetch daily challenge" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { DailyQuestionAnswers, DailyQuestion } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { questionId, answer, submittedBy } = body;

    if (!questionId || !answer?.trim()) {
      return NextResponse.json(
        { error: "questionId and answer are required" },
        { status: 400 }
      );
    }

    // Ensure question exists
    const [question] = await db
      .select()
      .from(DailyQuestion)
      .where(eq(DailyQuestion.id, Number(questionId)))
      .limit(1);

    if (!question) {
      return NextResponse.json(
        { error: `Invalid questionId ${questionId}. Question not found.` },
        { status: 404 }
      );
    }

    // Insert answer (use lowercase keys matching schema)
    const [inserted] = await db
      .insert(DailyQuestionAnswers)
      .values({
        questionId: Number(questionId),
        answer: answer.trim(),
        submittedBy: submittedBy?.trim() || "Anonymous",
      })
      .returning();

    return NextResponse.json(
      { message: "Answer submitted successfully", data: inserted },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Failed to submit answer:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

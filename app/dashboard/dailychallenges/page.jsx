"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function DailyQuestionCard() {
  const { user } = useUser();
  const [question, setQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch("/api/daily-question");
        const data = await res.json();
        console.log("Fetched daily question:", data);
        setQuestion(data);
      } catch (err) {
        console.error("Failed to fetch daily question:", err);
      }
    }
    fetchQuestion();
  }, []);

  if (!question) return <p className="text-center mt-8 text-gray-500">Loading daily challenge...</p>;

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return alert("Please write your answer first.");
    if (!userEmail) return alert("You must be logged in to submit an answer.");
    if (!question.id) return alert("Invalid question ID!");

    try {
      const res = await fetch("/api/daily-question/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer: userAnswer.trim(),
          submittedBy: userEmail,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        alert("✅ Your answer has been submitted!");
      } else {
        const data = await res.json();
        alert(data?.error || "❌ Failed to submit your answer.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting your answer.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gradient-to-r from-indigo-50 to-white rounded-3xl shadow-xl border border-indigo-100">
      <h2 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
        🔥 Daily Challenge
      </h2>

      <p className="mt-4 text-gray-800 text-lg leading-relaxed">{question.question}</p>

      {/* Show/Hide AI Answer */}
      <div className="mt-6">
        {!showAnswer ? (
          <Button
            onClick={() => setShowAnswer(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
          >
            Show Answer
          </Button>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50 border-l-4 border-indigo-400 shadow-sm">
            <p className="font-semibold text-indigo-700">Answer:</p>
            <p className="mt-1 text-gray-800">{question.answer}</p>
            <Button
              onClick={() => setShowAnswer(false)}
              variant="outline"
              size="sm"
              className="mt-3 text-indigo-600 border-indigo-600 hover:bg-indigo-100"
            >
              Hide Answer
            </Button>
          </div>
        )}
      </div>

      {/* User Answer Submission */}
      {!submitted && userEmail && (
        <div className="mt-6 flex flex-col gap-2">
          <textarea
            className="w-full border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            rows={4}
            placeholder="Write your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
          >
            Submit Answer
          </Button>
        </div>
      )}

      {!userEmail && (
        <p className="mt-4 text-red-600 font-medium text-center">
          ⚠️ You must be logged in to submit an answer.
        </p>
      )}

      {submitted && (
        <p className="mt-4 text-green-600 font-semibold text-center">
          ✅ You have submitted your answer!
        </p>
      )}

      <div className="mt-6 text-sm text-gray-500 text-center">
        <span className="font-medium">Category:</span> {question.category} |{" "}
        <span className="font-medium">Difficulty:</span> {question.difficulty}
      </div>
    </div>
  );
}

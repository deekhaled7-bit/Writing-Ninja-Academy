import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitQuizAnswers } from "@/app/actions/quiz-actions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, storyId, userId, score, answers, bookAssignmentId, submissionId } =
      await request.json();

    if (!quizId || !storyId || !userId || score === undefined || !submissionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the user is submitting their own quiz
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use the server action to submit the quiz
    const result = await submitQuizAnswers({
      quizId,
      storyId,
      userId,
      score,
      answers,
      bookAssignmentId,
      submissionId
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      submissionId: result.submissionId 
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
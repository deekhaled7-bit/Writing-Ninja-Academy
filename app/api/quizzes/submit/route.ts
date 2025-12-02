import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitQuizAnswers } from "@/app/actions/quiz-actions";
import InteractionsModel from "@/models/interactionsModel";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import UserModel from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      quizId,
      storyId,
      userId,
      score,
      answers,
      bookAssignmentId,
      submissionId,
    } = await request.json();

    if (
      !quizId ||
      !storyId ||
      !userId ||
      score === undefined ||
      !submissionId
    ) {
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
      submissionId,
    });

    // Fetch quiz data to get createdBy field
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if this is the first time completing this quiz
    const completedSubmissionsCount = await QuizSubmission.countDocuments({
      quizId,
      studentId: userId,
      completedAt: { $exists: true, $ne: null },
    });

    let awardedNinjaGold = 0;
    // If this is the first completion (count is 1 because we just updated it), award points
    if (completedSubmissionsCount === 1) {
      awardedNinjaGold = 10;
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { ninjaGold: awardedNinjaGold },
      });
    }

    InteractionsModel.create({
      userId: userId,
      notifyUserId: quiz.createdBy,
      broadcast: false,
      link: `${process.env.baseUrl}/teacher/quizzes`,
      targetId: quizId,
      targetType: "quiz",
      actionType: "completed",
      parentId: quizId,
      parentType: "quiz",
      read: false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      awardedNinjaGold,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

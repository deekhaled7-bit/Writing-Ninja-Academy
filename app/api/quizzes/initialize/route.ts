import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import  QuizSubmission  from "@/models/QuizSubmission";
import  Quiz  from "@/models/Quiz";
import { connectToDatabase } from "@/utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const { quizId, studentId } = await request.json();

    if (!quizId || !studentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the quiz to calculate totalPossibleScore
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate total possible score
    const totalPossibleScore = quiz.questions.reduce((total: number, question:any) => {
      return total + (question.points || 1);
    }, 0);

    // Create a new quiz submission
    // const submission = await QuizSubmission.create({
    //   quizId,
    //   studentId,
    //   totalPossibleScore,
    //   answers: [],
    //   score: 0,
    //   percentageScore: 0,
    //   passed: false,
    //   startedAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      // submissionId: submission._id.toString(),
    });
  } catch (error) {
    console.error("Error initializing quiz submission:", error);
    return NextResponse.json(
      { error: "Failed to initialize quiz submission" },
      { status: 500 }
    );
  }
}
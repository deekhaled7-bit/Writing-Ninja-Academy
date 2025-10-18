import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import { authOptions } from "@/lib/auth";

// Define types for quiz data
interface QuizOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  _id: string;
  questionText: string;
  options: QuizOption[];
  points: number;
}

interface QuizDocument {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  storyId?: {
    _id: string;
    title: string;
  };
  timeLimit?: number;
  passingScore?: number;
  createdBy: string;
  createdAt: string;
}

// GET /api/student/quizzes/[quizId] - Get a specific quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = params;
    await connectDB();

    // Find the quiz
    const quiz = (await Quiz.findById(quizId)
      .populate("storyId", "title")
      .lean()) as unknown as QuizDocument;

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if student has already submitted this quiz
    const studentId = session.user.id;
    const submission = await QuizSubmission.findOne({
      quizId,
      studentId,
    });

    // For security, don't send correct answers unless the quiz has been submitted
    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map((question: any) => ({
        ...question,
        options: question.options.map((option: any) => ({
          _id: option._id,
          text: option.text,
          // Only include isCorrect if the quiz has been submitted
          ...(submission ? { isCorrect: option.isCorrect } : {}),
        })),
      })),
      submission: submission
        ? {
            _id: submission._id,
            score: submission.score,
            totalPossibleScore: submission.totalPossibleScore,
            percentageScore: submission.percentageScore,
            passed: submission.passed,
            completedAt: submission.completedAt,
            answers: submission.answers,
          }
        : null,
    };

    return NextResponse.json({ quiz: safeQuiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { message: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import mongoose from "mongoose";

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
  timeLimit?: number;
  passingScore?: number;
  createdBy: string;
  createdAt: string;
}

// POST /api/student/quizzes/[quizId]/submit - Submit a quiz
export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;
    const { quizId } = params;
    const { answers } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: "Invalid submission data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the quiz
    const quiz = await Quiz.findById(quizId).lean() as unknown as QuizDocument;
    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check if student has already submitted this quiz
    const existingSubmission = await QuizSubmission.findOne({
      quizId,
      studentId
    });

    if (existingSubmission) {
      return NextResponse.json(
        { message: "You have already submitted this quiz" },
        { status: 400 }
      );
    }

    // Calculate score
    let score = 0;
    let totalPossibleScore = 0;

    // Process each answer
    const submittedAnswers = answers.map((answer: any) => {
      const question = quiz.questions.find(
        (q: any) => q._id.toString() === answer.questionId
      );

      if (!question) {
        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: false,
          points: 0
        };
      }

      // Find the selected option
      const selectedOption = question.options.find(
        (opt: any) => opt._id.toString() === answer.selectedOptionId
      );

      // Check if the answer is correct
      const isCorrect = selectedOption?.isCorrect || false;
      
      // Add points if correct
      const points = isCorrect ? question.points : 0;
      score += points;
      totalPossibleScore += question.points;

      return {
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
        points
      };
    });

    // Calculate percentage score
    const percentageScore = totalPossibleScore > 0 
      ? Math.round((score / totalPossibleScore) * 100) 
      : 0;

    // Check if passed
    const passingScore = quiz.passingScore || 70;
    const passed = percentageScore >= passingScore;

    // Create submission
    const submission = new QuizSubmission({
      quizId,
      studentId,
      answers: submittedAnswers,
      score,
      totalPossibleScore,
      percentageScore,
      passed,
      completedAt: new Date()
    });

    await submission.save();

    return NextResponse.json({
      message: "Quiz submitted successfully",
      submission: {
        _id: submission._id,
        score,
        totalPossibleScore,
        percentageScore,
        passed,
        completedAt: submission.completedAt
      }
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { message: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
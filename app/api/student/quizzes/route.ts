import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import mongoose from "mongoose";

// Define types for quiz data
interface QuizDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  questions: any[];
  storyId?: any;
  timeLimit?: number;
  passingScore?: number;
  createdBy: string;
  createdAt: string;
}

interface QuizSubmissionDocument {
  _id: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  studentId: string;
  score: number;
  totalPossibleScore: number;
  percentageScore: number;
  passed: boolean;
  completedAt: Date;
}

// GET /api/student/quizzes - Get all quizzes available to the student
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const storyId = searchParams.get("storyId");

    // Build query
    const query: any = {};
    if (storyId) {
      query.storyId = new mongoose.Types.ObjectId(storyId);
    }

    // Get quizzes
    const quizzes = await Quiz.find(query)
      .populate("storyId", "title")
      .sort({ createdAt: -1 })
      .lean() as unknown as QuizDocument[];

    // Get student's submissions for these quizzes
    const studentId = session.user.id;
    const submissions = await QuizSubmission.find({
      studentId,
      quizId: { $in: quizzes.map(quiz => quiz._id) }
    }).lean();

    // Map submissions to quizzes
    const quizzesWithSubmission = quizzes.map(quiz => {
      const submission = submissions.find(sub => 
        sub.quizId.toString() === quiz._id.toString()
      );
      
      return {
        ...quiz,
        submission: submission ? {
          _id: submission._id,
          score: submission.score,
          totalPossibleScore: submission.totalPossibleScore,
          percentageScore: submission.percentageScore,
          passed: submission.passed,
          completedAt: submission.completedAt
        } : null
      };
    });

    return NextResponse.json({ quizzes: quizzesWithSubmission });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { message: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
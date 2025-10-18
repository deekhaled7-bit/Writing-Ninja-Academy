import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";

// Define types for user and submission data
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface QuizSubmissionDocument {
  _id: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  score: number;
  totalPossibleScore: number;
  percentageScore: number;
  passed: boolean;
  completedAt: Date;
  answers: any[];
}

// GET /api/teacher/quizzes/[quizId]/submissions - Get all submissions for a quiz
export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher role
    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { message: "Only teachers can access this endpoint" },
        { status: 403 }
      );
    }

    const { quizId } = params;
    await connectDB();

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Verify that the teacher created this quiz
    if (quiz.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "You can only view submissions for quizzes you created" },
        { status: 403 }
      );
    }

    // Get all submissions for this quiz
    const submissions = await QuizSubmission.find({ quizId })
      .sort({ completedAt: -1 })
      .lean() as unknown as QuizSubmissionDocument[];

    // Get student information for each submission
    const studentIds = submissions.map((sub) => sub.studentId);
    const students = await UserModel.find(
      { _id: { $in: studentIds } },
      { name: 1, email: 1 }
    ).lean() as unknown as UserDocument[];

    // Map student info to submissions
    const submissionsWithStudentInfo = submissions.map((submission) => {
      const student = students.find(
        (s) => s._id.toString() === submission.studentId.toString()
      );

      return {
        ...submission,
        student: student
          ? {
              _id: student._id,
              name: student.name,
              email: student.email,
            }
          : null,
      };
    });

    return NextResponse.json({ submissions: submissionsWithStudentInfo });
  } catch (error) {
    console.error("Error fetching quiz submissions:", error);
    return NextResponse.json(
      { message: "Failed to fetch quiz submissions" },
      { status: 500 }
    );
  }
}
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
  firstName: string;
  lastName: string;
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
  { params }: { params: Promise<{ quizId: string }> }
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

    const { quizId } = await params;
    await connectDB();

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Verify that the teacher created this quiz
    // if (quiz.createdBy.toString() !== session.user.id) {
    //   return NextResponse.json(
    //     { message: "You can only view submissions for quizzes you created" },
    //     { status: 403 }
    //   );
    // }

    // Get all submissions for this quiz with populated student data
    const submissions = await QuizSubmission.find({ quizId })
      .populate({
        path: "studentId",
        model: UserModel,
        select: "name email firstName lastName profilePicture",
      })
      .sort({ completedAt: -1 });

    // Format the submissions for the frontend
    const submissionsWithStudentInfo = submissions.map((submission) => {
      const submissionObj = submission.toObject();
      return {
        ...submissionObj,
        student: submissionObj.studentId
          ? {
              _id: submissionObj.studentId._id,
              name: submissionObj.studentId.name,
              email: submissionObj.studentId.email,
              firstName: submissionObj.studentId.firstName,
              lastName: submissionObj.studentId.lastName,
              profilePicture: submissionObj.studentId.profilePicture,
            }
          : null,
        // Ensure answers are included in the response
        answers: submissionObj.answers || [],
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

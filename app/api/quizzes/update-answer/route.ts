import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QuizSubmission from "@/models/QuizSubmission";
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
    const { submissionId, answer } = await request.json();

    if (!submissionId || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the submission
    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Add the answer to the submission
    submission.answers.push(answer);
    await submission.save();
console.log('from route')
    return NextResponse.json({
      success: true,
      message: "Answer added to submission"
    });
  } catch (error) {
    console.error("Error updating quiz submission:", error);
    return NextResponse.json(
      { error: "Failed to update quiz submission" },
      { status: 500 }
    );
  }
}
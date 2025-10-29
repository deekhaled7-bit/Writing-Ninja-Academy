import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectToDatabase } from "@/utils/mongodb";
import { ConnectDB } from "@/config/db";

// GET: Fetch a specific quiz by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { quizId } = await params;

    // Fetch the quiz
    console.log("the quizID" + quizId);
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if the quiz belongs to the teacher
    if (quiz.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to access this quiz" },
        { status: 403 }
      );
    }
    console.log(JSON.stringify(quiz));
    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { message: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific quiz and its submissions
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { quizId } = await params;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if the quiz belongs to the teacher
    if (quiz.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to delete this quiz" },
        { status: 403 }
      );
    }

    // Delete the quiz
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    
    // Also delete any submissions for this quiz
    await QuizSubmission.deleteMany({ quizId });
    
    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { message: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}

// PUT: Update a specific quiz
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { quizId } = await params;
    const body = await req.json();

    // Find the quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Check if the quiz belongs to the teacher
    if (quiz.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to update this quiz" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.questions ||
      body.questions.length === 0
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate each question has at least 2 options and one correct answer
    for (const question of body.questions) {
      if (
        !question.questionText ||
        !question.options ||
        question.options.length < 2
      ) {
        return NextResponse.json(
          { message: "Each question must have text and at least 2 options" },
          { status: 400 }
        );
      }

      // Check if at least one option is marked as correct
      const hasCorrectOption = question.options.some(
        (option: any) => option.isCorrect
      );
      if (!hasCorrectOption) {
        return NextResponse.json(
          { message: "Each question must have at least one correct option" },
          { status: 400 }
        );
      }
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { ...body },
      { new: true }
    );

    return NextResponse.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { message: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Quiz from "@/models/Quiz";
import { ConnectDB } from "@/config/db";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { connectToDatabase } from "@/utils/mongodb";

// GET: Fetch all quizzes created by the teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");

    // Build query
    const query: any = { createdBy: session.user.id };
    if (storyId) {
      query.storyId = storyId;
    }

    // Fetch quizzes with populated story data
    const quizzes = await Quiz.find(query)
      .populate("storyId", "title")
      .sort({ createdAt: -1 });
    // console.log("title" + quizzes[0].storyId.title);
    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { message: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST: Create a new quiz
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const body = await req.json();

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

    // Create new quiz
    console.log("body" + JSON.stringify(body));
    const newQuiz = await Quiz.create({
      ...body,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: "Quiz created successfully",
        quiz: newQuiz,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { message: "Failed to create quiz" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a quiz
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json(
        { message: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Find the quiz and check if it belongs to the teacher
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    if (quiz.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to delete this quiz" },
        { status: 403 }
      );
    }

    // Delete the quiz
    await Quiz.findByIdAndDelete(quizId);

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { message: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}

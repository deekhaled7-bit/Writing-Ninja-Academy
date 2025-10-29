import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Quiz from "@/models/Quiz";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if a quiz already exists for this story
    console.log("here checking");
    const existingQuiz = await Quiz.findOne({ storyId: storyId });
    console.log(existingQuiz ? existingQuiz.title + " title" : "No quiz found");
    return NextResponse.json({
      exists: !!existingQuiz,
      quizId: existingQuiz?._id || null,
    });
  } catch (error) {
    console.error("Error checking quiz existence:", error);
    return NextResponse.json(
      { error: "Failed to check quiz existence" },
      { status: 500 }
    );
  }
}

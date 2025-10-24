import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getQuizData } from "@/app/actions/quiz-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || "";
    const { storyId } = await params;

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    // Use server action to fetch quiz data
    const { quiz, story } = await getQuizData(storyId, userId);

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (!quiz) {
      // Generate a default quiz with generic questions
      const defaultQuiz = {
        title: `Quiz for ${story.title}`,
        questions: [
          {
            _id: `${storyId}-q1`,
            question: "What is the main character's name?",
            options: ["John", "Sarah", "Michael", "Emma"],
            correctAnswer: 1,
          },
          {
            _id: `${storyId}-q2`,
            question: "Where does the story take place?",
            options: ["New York", "London", "Paris", "Tokyo"],
            correctAnswer: 1,
          },
          {
            _id: `${storyId}-q3`,
            question: "What is the main theme of the story?",
            options: ["Love", "Friendship", "Adventure", "Mystery"],
            correctAnswer: 2,
          },
        ],
      };

      return NextResponse.json({ quiz: defaultQuiz });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

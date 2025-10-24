import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuizComponent from "@/components/stories/quiz-component";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define interfaces for our data
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

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  storyId: string;
}

// Import the server actions directly
import {
  getQuizData as fetchQuizData,
  initializeQuizSubmission,
} from "@/app/actions/quiz-actions";

// Function to fetch quiz data and initialize submission
async function getQuizData(storyId: string, userId: string) {
  try {
    // Use the server action directly instead of fetch
    const { quiz } = await fetchQuizData(storyId, userId);

    if (quiz) {
      // Initialize quiz submission
      const result = await initializeQuizSubmission({
        quizId: quiz._id.toString(),
        studentId: userId,
      });

      if (result.success && result.submissionId) {
        // Add submissionId to quiz object
        quiz.submissionId = result.submissionId;
      }
    }

    return quiz;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

// Format quiz data for the QuizComponent
function formatQuizForComponent(quiz: any) {
  if (!quiz) return null;

  // Properly serialize MongoDB objects by converting to strings
  return {
    _id: quiz._id ? quiz._id.toString() : "",
    storyId: quiz.storyId
      ? typeof quiz.storyId === "object" && quiz.storyId._id
        ? quiz.storyId._id.toString()
        : quiz.storyId.toString()
      : "",
    title: quiz.title || "",
    description: quiz.description || "",
    submissionId: quiz.submissionId || null,
    questions: quiz.questions.map((q: any) => ({
      _id: q._id ? q._id.toString() : "",
      question: q.questionText || "",
      options: q.options.map((o: any) => o.text || ""),
      correctAnswer: q.options.findIndex((o: any) => o.isCorrect),
    })),
  };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  // Get the user session
  const session = await getServerSession(authOptions);

  // Await params to get storyId
  const { storyId } = await params;

  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect("/signin?callbackUrl=/student/quiz/" + storyId);
  }

  try {
    // Fetch quiz data with user ID
    const quizData = await getQuizData(storyId, session.user.id as string);

    // Format quiz data for the component
    const formattedQuiz = formatQuizForComponent(quizData);

    // If no quiz data is found, show an error message
    if (!formattedQuiz) {
      return (
        <div className="container mx-auto py-8">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
            <p className="mb-4">
              Sorry, we couldn&apos;t find a quiz for this story.
            </p>
          </Card>
        </div>
      );
    }

    // Render the quiz component
    return (
      <div className="container bg-ninja-white mx-auto py-8">
        <Suspense
          fallback={
            <Card className="p-6 text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading quiz...</span>
                </div>
              </CardContent>
            </Card>
          }
        >
          <h1 className="text-2xl font-bold mb-6">{formattedQuiz.title}</h1>
          <p className="mb-6">{formattedQuiz.description}</p>
          <QuizComponent
            quiz={formattedQuiz}
            storyId={storyId}
            userId={session.user.id || ""}
            bookAssignmentId={undefined} // This could be passed from the URL query if needed
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in quiz page:", error);
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Quiz</h1>
          <p className="mb-4">
            Sorry, something went wrong while loading the quiz. Please try again
            later.
          </p>
        </Card>
      </div>
    );
  }
}

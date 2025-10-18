"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, FileQuestion } from "lucide-react";
import { toast } from "sonner";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  questions: Array<{
    questionText: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    points: number;
  }>;
  storyId?: {
    _id: string;
    title: string;
  };
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
};

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/quizzes");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes);
      } else {
        toast.error("Failed to fetch quizzes");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("An error occurred while fetching quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        const response = await fetch(`/api/teacher/quizzes?quizId=${quizId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Quiz deleted successfully");
          fetchQuizzes(); // Refresh the list
        } else {
          toast.error("Failed to delete quiz");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("An error occurred while deleting the quiz");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="bg-ninja-cream p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ninja-black">Quizzes</h1>
        <Button
          onClick={() => router.push("/teacher/quizzes/create")}
          className="bg-ninja-peach/90 hover:bg-ninja-peach/60"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileQuestion className="h-16 w-16 text-ninja-crimson opacity-50 mb-4" />
            <p className="text-lg font-medium text-ninja-black mb-2">
              No Quizzes Found
            </p>
            <p className="text-ninja-black text-center mb-6">
              You haven&apos;t created any quizzes yet. Create your first quiz
              to get started!
            </p>
            <Button
              onClick={() => router.push("/teacher/quizzes/create")}
              className="bg-ninja-crimson hover:bg-ninja-crimson/90"
            >
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="bg-white text-ninja-black shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-ninja-black">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.storyId?.title || "can't get the title"}
                </p>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex items-center text-xs text-ninja-black mb-4">
                  <span className="mr-4">
                    {quiz.questions.length} Questions
                  </span>
                  {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                </div>
                {quiz.storyId && (
                  <p className="text-xs text-ninja-black mb-4">
                    Linked to: {quiz.storyId.title}
                  </p>
                )}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teacher/quizzes/${quiz._id}`)}
                    className="text-ninja-crimson border-ninja-crimson hover:bg-ninja-crimson/10"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

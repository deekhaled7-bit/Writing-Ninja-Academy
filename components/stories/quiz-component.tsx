"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  _id: string;
  storyId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  submissionId?: string;
}

interface QuizComponentProps {
  quiz: Quiz;
  storyId: string;
  userId: string;
  bookAssignmentId?: string;
}

export default function QuizComponent({
  quiz,
  storyId,
  userId,
  bookAssignmentId,
}: QuizComponentProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  // Get submission ID from props if available
  useEffect(() => {
    if (quiz.submissionId) {
      setSubmissionId(quiz.submissionId);
    }
  }, [quiz.submissionId]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerSubmitted) return; // Prevent changing answer after submission
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      toast({
        title: "Please select an answer",
        description: "You need to select an option before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsAnswerSubmitted(true);

    // Check if answer is correct
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    // Update score if correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Save the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    // Update the submission with the current answer
    if (submissionId) {
      updateQuizSubmission(
        submissionId,
        currentQuestion._id,
        selectedOption,
        isCorrect
      );
    }

    // Feedback is shown and user must click Next Question button to proceed
    // No automatic transition
  };

  // Function to update quiz submission with each answer
  const updateQuizSubmission = async (
    submissionId: string,
    questionId: string,
    selectedOption: number,
    isCorrect: boolean
  ) => {
    try {
      // Import the server action dynamically
      const { updateQuizAnswer } = await import("@/app/actions/quiz-actions");

      const result = await updateQuizAnswer({
        submissionId,
        answer: {
          questionId,
          selectedOptionIndex: selectedOption,
          isCorrect,
        },
      });

      if (!result.success) {
        console.error("Failed to update quiz submission with answer");
      }
    } catch (error) {
      console.error("Error updating quiz submission:", error);
    }
  };

  const submitQuizResults = async () => {
    try {
      setIsSubmitting(true);
      const finalScore =
        ((score + (selectedOption === currentQuestion.correctAnswer ? 1 : 0)) /
          totalQuestions) *
        100;

      // Format answers for API submission
      const formattedAnswers = answers.map((answer, index) => ({
        questionId: quiz.questions[index]._id,
        selectedOption: answer,
        isCorrect: answer === quiz.questions[index].correctAnswer,
      }));

      const response = await fetch(`/api/quizzes/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz._id,
          storyId,
          userId,
          score: finalScore,
          // Don't send answers again since they're already in the database
          bookAssignmentId,
          submissionId: submissionId, // Include the submission ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to submit quiz results"
        );
      }

      toast({
        className: "bg-ninja-crimson text-white",
        title: "Quiz Completed!",
        description: `You scored ${finalScore.toFixed(0)}% on this quiz.${
          data.awardedNinjaGold
            ? ` You earned ${data.awardedNinjaGold} Ninja Gold!`
            : ""
        }`,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionClassName = (optionIndex: number) => {
    if (!isAnswerSubmitted) {
      return selectedOption === optionIndex
        ? "border-2 border-ninja-blue bg-blue-50"
        : "border hover:border-ninja-blue";
    }

    if (optionIndex === currentQuestion.correctAnswer) {
      return "border-2 border-green-500 bg-green-50";
    }

    if (
      selectedOption === optionIndex &&
      optionIndex !== currentQuestion.correctAnswer
    ) {
      return "border-2 border-red-500 bg-red-50";
    }

    return "border opacity-50";
  };

  if (quizCompleted) {
    const finalScore = (score / totalQuestions) * 100;

    return (
      <Card className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <div className="text-5xl font-bold mb-4 text-ninja-blue">
          {finalScore.toFixed(0)}%
        </div>
        <p className="mb-6">
          You scored {score} out of {totalQuestions} questions correctly.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push(`/stories/${storyId}`)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Results..." : "Back to Story"}
          </Button>
          <Button
            onClick={() => router.push("/student")}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Results..." : "Go to Dashboard"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-sm font-medium">
          Score: {score}/{currentQuestionIndex}
        </span>
      </div>

      {/* Question card */}
      <Card className="p-6 bg-ninja-white text-ninja-dark-gray">
        <h2 className="text-xl font-semibold mb-4">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg cursor-pointer transition-all ${getOptionClassName(
                index
              )}`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center">
                <div className="flex-1">{option}</div>
                {isAnswerSubmitted && (
                  <div className="ml-2">
                    {index === currentQuestion.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : selectedOption === index ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit and Next buttons */}
        <div className="mt-6">
          {!isAnswerSubmitted ? (
            <Button
              variant={"destructive"}
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              variant={"default"}
              onClick={() => {
                if (currentQuestionIndex < totalQuestions - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setSelectedOption(null);
                  setIsAnswerSubmitted(false);
                } else {
                  // Quiz completed
                  setQuizCompleted(true);
                  submitQuizResults();
                }
              }}
              className="w-full"
            >
              {currentQuestionIndex < totalQuestions - 1
                ? "Next Question"
                : "See My Results"}
            </Button>
          )}
        </div>
      </Card>

      {/* Feedback message */}
      {isAnswerSubmitted && (
        <div
          className={`p-4 rounded-lg ${
            selectedOption === currentQuestion.correctAnswer
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {selectedOption === currentQuestion.correctAnswer ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 mr-2" />
                <span>
                  Incorrect. The correct answer is:{" "}
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

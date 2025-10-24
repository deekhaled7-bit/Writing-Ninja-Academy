"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Quiz from "@/models/Quiz";

// Fetch quiz data for a story
export async function getQuizData(storyId: string, userId: string) {
  try {
    await dbConnect();

    // Import models dynamically to avoid circular dependencies
    const Story = (await import("@/models/Story")).default;
    const BookAssignment = (await import("@/models/BookAssignment")).default;
    const Quiz = (await import("@/models/Quiz")).default;

    // Use lean() for more efficient queries that return plain objects
    const [quiz, story, bookAssignment] = await Promise.all([
      Quiz.findOne({ storyId }),
      Story.findById(storyId),
      BookAssignment.findOne({
        studentId: userId,
        storyId,
      }),
    ]);
    console.log("theQuiz" + quiz);
    return {
      quiz: quiz || null,
      story: story || null,
      bookAssignment: bookAssignment || null,
    };
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return { quiz: null, story: null, bookAssignment: null };
  }
}

// Initialize a quiz submission when a user starts a quiz
export async function initializeQuizSubmission({
  quizId,
  studentId,
}: {
  quizId: string;
  studentId: string;
}) {
  await dbConnect();

  const Quiz = (await import("@/models/Quiz")).default;
  const QuizSubmission = (await import("@/models/QuizSubmission")).default;

  try {
    // Get the quiz to calculate total possible score
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate total possible score
    const totalPossibleScore = quiz.questions.reduce(
      (total: number, q: any) => total + (q.points || 1),
      0
    );

    // Create a new quiz submission with empty answers
    const submission = await QuizSubmission.create({
      quizId,
      studentId,
      answers: [],
      score: 0,
      totalPossibleScore,
      percentageScore: 0,
      passed: false,
    });

    return {
      success: true,
      submissionId: submission._id.toString(),
      totalPossibleScore,
    };
  } catch (error) {
    console.error("Error initializing quiz submission:", error);
    return { success: false, error: "Failed to initialize quiz submission" };
  }
}

// Submit quiz answers
// Update a quiz submission with a single answer
export async function updateQuizAnswer({
  submissionId,
  answer,
}: {
  submissionId: string;
  answer: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  };
}) {
  await dbConnect();

  // Import models dynamically
  const QuizSubmission = (await import("@/models/QuizSubmission")).default;

  try {
    // Find the submission
    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return { success: false, error: "Submission not found" };
    }
    console.log("beforePushing" + answer);
    // Add the answer to the submission
    submission.answers.push(answer);
    await submission.save();

    return { success: true };
  } catch (error) {
    console.error("Error updating quiz answer:", error);
    return { success: false, error: "Failed to update quiz answer" };
  }
}

export async function submitQuizAnswers({
  quizId,
  storyId,
  userId,
  answers = [],
  score,
  bookAssignmentId,
  submissionId, // Add submissionId parameter
}: {
  quizId: string;
  storyId: string;
  userId: string;
  answers?: any[];
  score: number;
  bookAssignmentId?: string;
  submissionId?: string; // Make it optional for backward compatibility
}) {
  await dbConnect();

  // Import models dynamically
  const QuizSubmission = (await import("@/models/QuizSubmission")).default;
  const BookAssignment = (await import("@/models/BookAssignment")).default;

  try {
    let submission;

    // Get the quiz to calculate total possible score
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate total possible score
    const totalPossibleScore = quiz.questions.reduce(
      (total: number, q: { points?: number }) => total + (q.points || 1),
      0
    );

    // If submissionId is provided, update the existing submission
    if (submissionId) {
      console.log("from action");
      const updateData: any = {
        score,
        percentageScore: score,
        passed: score / totalPossibleScore >= 0.6, // Pass if score is 60% or higher
        completedAt: new Date(),
      };

      // Only include answers in the update if they were provided
      if (answers && answers.length > 0) {
        updateData.answers = answers;
      }

      submission = await QuizSubmission.findByIdAndUpdate(
        submissionId,
        updateData,
        { new: true }
      );

      if (!submission) {
        throw new Error("Submission not found");
      }
    }
    // else {
    //   // Create a new quiz submission if no submissionId provided
    //   submission = await QuizSubmission.create({
    //     quizId,
    //     studentId: userId, // Changed from userId to studentId to match the model
    //     answers,
    //     score,
    //     totalPossibleScore,
    //     percentageScore: (score / totalPossibleScore) * 100,
    //     passed: score / totalPossibleScore >= 0.6, // Pass if score is 60% or higher
    //     completedAt: new Date(),
    //   });
    // }

    // Update the book assignment if it exists
    if (bookAssignmentId) {
      await BookAssignment.findByIdAndUpdate(bookAssignmentId, {
        quizScore: score,
        quizSubmissionId: submission._id,
        hasCompletedQuiz: true,
      });
    }

    // Revalidate the quiz page to reflect the changes
    revalidatePath(`/student/quiz/${storyId}`);

    return { success: true, submissionId: submission._id.toString() };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}

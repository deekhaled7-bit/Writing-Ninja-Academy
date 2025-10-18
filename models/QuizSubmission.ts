import mongoose, { Schema, Document } from "mongoose";

// Interface for a submitted answer
export interface ISubmittedAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
  points: number;
}

// Interface for the QuizSubmission document
export interface IQuizSubmission extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: ISubmittedAnswer[];
  score: number;
  totalPossibleScore: number;
  percentageScore: number;
  passed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for submitted answers
const SubmittedAnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, default: 0 },
});

// Main QuizSubmission schema
const QuizSubmissionSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [SubmittedAnswerSchema], default: [] },
    score: { type: Number, default: 0 },
    totalPossibleScore: { type: Number, required: true },
    percentageScore: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Create and export the QuizSubmission model
export default mongoose.models.QuizSubmission || 
  mongoose.model<IQuizSubmission>("QuizSubmission", QuizSubmissionSchema);
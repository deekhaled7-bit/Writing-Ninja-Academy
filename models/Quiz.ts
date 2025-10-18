import mongoose, { Schema, Document } from "mongoose";

// Interface for a quiz option
export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

// Interface for a quiz question
export interface IQuizQuestion {
  questionText: string;
  options: IQuizOption[];
  points: number;
}

// Interface for the Quiz document
export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: IQuizQuestion[];
  createdBy: mongoose.Types.ObjectId;
  storyId?: mongoose.Types.ObjectId;
  timeLimit?: number; // in minutes
  passingScore?: number; // minimum score to pass
  createdAt: Date;
  updatedAt: Date;
}

// Schema for quiz options
const QuizOptionSchema = new Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

// Schema for quiz questions
const QuizQuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: { type: [QuizOptionSchema], required: true },
  points: { type: Number, default: 1 },
});

// Main Quiz schema
const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [QuizQuestionSchema], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    storyId: { type: Schema.Types.ObjectId, ref: "Story" }, // Optional reference to a story
    timeLimit: { type: Number }, // Optional time limit in minutes
    passingScore: { type: Number }, // Optional passing score
  },
  { timestamps: true }
);

// Create and export the Quiz model
export default mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
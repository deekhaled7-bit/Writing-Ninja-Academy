import mongoose, { Schema, Document } from "mongoose";

export interface IBookAssignment extends Document {
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId | null; // null means assigned to entire class
  classId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  title: string;
  assignedDate: Date;
  // dueDate: Date | null;
  isCompleted: boolean;
  readingProgress: number; // percentage of completion (0-100)
  lastReadDate: Date | null;
  quizScore: number | null; // percentage score on the quiz (0-100)
  quizSubmissionId: mongoose.Types.ObjectId | null; // reference to the quiz submission
}

const BookAssignmentSchema: Schema = new Schema<IBookAssignment>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means assigned to entire class
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastReadDate: {
      type: Date,
      default: null,
    },
    quizScore: {
      type: Number,
      default: null,
    },
    quizSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: "QuizSubmission",
      default: null,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
BookAssignmentSchema.index({ teacherId: 1, classId: 1, storyId: 1 });
BookAssignmentSchema.index({ studentId: 1, isCompleted: 1 });

export default mongoose.models.BookAssignment ||
  mongoose.model<IBookAssignment>("BookAssignment", BookAssignmentSchema);

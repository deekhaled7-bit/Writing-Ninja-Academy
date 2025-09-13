import mongoose, { Schema, Document, Types } from "mongoose";

export interface IClass extends Document {
  className: string;
  grade: Types.ObjectId; // Reference to Grade model
  // Note: teachers and students are now stored in UserModel with assignedClasses
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    // teachers: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // students: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

// Create an index for grade to improve query performance
ClassSchema.index({ grade: 1 });

const ClassModel =
  mongoose.models.Class || mongoose.model("Class", ClassSchema);

export default ClassModel;

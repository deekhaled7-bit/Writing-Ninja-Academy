import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGrade extends Document {
  gradeNumber: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new mongoose.Schema(
  {
    gradeNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure gradeNumber is unique
GradeSchema.index({ gradeNumber: 1 }, { unique: true });

const GradeModel = mongoose.models.Grade || mongoose.model("Grade", GradeSchema);

export default GradeModel;
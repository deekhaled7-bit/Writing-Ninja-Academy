import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISchool extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure gradeNumber is unique
// GradeSchema.index({ gradeNumber: 1 }, { unique: true });

const SchoolModel =
  mongoose.models.School || mongoose.model("School", SchoolSchema);

export default SchoolModel;

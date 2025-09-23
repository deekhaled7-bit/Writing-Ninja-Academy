import mongoose from "mongoose";

const ReadingProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
    currentPage: { type: Number, default: 0 }, // 1-based page number including cover
    totalPages: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReadingProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

const ReadingProgress =
  mongoose.models.ReadingProgress ||
  mongoose.model("ReadingProgress", ReadingProgressSchema);

export default ReadingProgress;



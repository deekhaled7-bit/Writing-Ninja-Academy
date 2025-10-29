import mongoose, { Schema } from "mongoose";
const StoryReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  username: { type: String, required: true }, // Keep for backward compatibility
  text: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "users" }], // Array of user references who liked this reply
  createdAt: { type: Date, default: Date.now },
});

// Define the VideoComment schema
const StoryCommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  username: { type: String, required: true }, // Keep for backward compatibility
  text: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "users" }], // Array of user references who liked this comment
  replies: [StoryReplySchema], // Array of replies to this comment
  createdAt: { type: Date, default: Date.now },
});

const StorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    ageGroup: {
      type: String,
      required: true,
      enum: ["5-8", "9-12", "13-17"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "fantasy",
        "adventure",
        "mystery",
        "science-fiction",
        "friendship",
        "family",
        "animals",
        "school",
        "humor",
        "other",
      ],
    },
    fileType: {
      type: String,
      required: true,
      enum: ["pdf", "video"],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    readCount: {
      type: Number,
      default: 0,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "users" }], // Array of user references who liked the video
    comments: [StoryCommentSchema],
    completedCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      required: false,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["waiting_revision", "published"],
      default: "waiting_revision",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        maxlength: 20,
      },
    ],
  },
  {
    timestamps: true,
  }
);

StorySchema.index({ category: 1, ageGroup: 1 });
StorySchema.index({ readCount: -1 });
StorySchema.index({ createdAt: -1 });

export default mongoose.models.Story || mongoose.model("Story", StorySchema);

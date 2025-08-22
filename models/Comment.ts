import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  isApproved: {
    type: Boolean,
    default: true, // Auto-approve for now, can add moderation later
  },
}, {
  timestamps: true,
});

CommentSchema.index({ story: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
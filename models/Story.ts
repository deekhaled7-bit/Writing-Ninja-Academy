import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
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
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  ageGroup: {
    type: String,
    required: true,
    enum: ['5-8', '9-12', '13-17'],
  },
  category: {
    type: String,
    required: true,
    enum: ['fantasy', 'adventure', 'mystery', 'science-fiction', 'friendship', 'family', 'animals', 'school', 'humor', 'other'],
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'video'],
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
    default: '',
  },
  readCount: {
    type: Number,
    default: 0,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
    maxlength: 20,
  }],
}, {
  timestamps: true,
});

StorySchema.index({ category: 1, ageGroup: 1 });
StorySchema.index({ readCount: -1 });
StorySchema.index({ createdAt: -1 });

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
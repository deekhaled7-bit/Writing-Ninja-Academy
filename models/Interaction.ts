import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['read', 'completed', 'liked'],
  },
}, {
  timestamps: true,
});

InteractionSchema.index({ user: 1, story: 1, type: 1 }, { unique: true });

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);
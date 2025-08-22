import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 5,
    max: 18,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  ninjaLevel: {
    type: Number,
    default: 1,
  },
  ninjaGold: {
    type: Number,
    default: 0,
  },
  achievements: [{
    type: String,
    enum: ['first-story', 'five-stories', 'ten-stories', 'first-hundred-reads', 'first-thousand-reads', 'story-master', 'reading-ninja']
  }],
  storiesUploaded: {
    type: Number,
    default: 0,
  },
  storiesRead: {
    type: Number,
    default: 0,
  },
  totalReads: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
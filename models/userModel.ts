import mongoose, { Schema, Document, Types } from "mongoose";
import subscriptionsModel from "./subscriptionsModel";
export interface ISubscription extends Document {
  paymentID: string;
  packageID: Types.ObjectId;
  email?: string;
  subscribed: boolean;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date; // Because of timestamps: true
}
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: false,
      // trim: true,
      minlength: 2,
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
    active: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: 5,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    ninjaLevel: {
      type: Number,
      default: 1,
    },
    // Separate character level driven by ninjaGold thresholds
    ninjaCharacterLevel: {
      type: Number,
      default: 1,
    },
    ninjaGold: {
      type: Number,
      default: 0,
    },
    nextLevelBonusPoints: {
      type: Number,
      default: 50,
    },
    ninjaReadingLevel: {
      type: Number,
      default: 1,
    },
    achievements: [
      {
        type: String,
        enum: [
          "first-story",
          "five-stories",
          "ten-stories",
          "first-hundred-reads",
          "first-thousand-reads",
          "story-master",
          "reading-ninja",
        ],
      },
    ],
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
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptions",
      required: false,
    },
    role: {
      type: String,
      default: "student",
      enum: ["admin", "teacher", "student"],
      required: false,
    },
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
    },
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;

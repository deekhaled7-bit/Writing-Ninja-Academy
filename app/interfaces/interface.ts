import { Types } from "mongoose";

export interface Story {
  _id: string;
  title: string;
  description: string;
  authorName: string;
  ageGroup: string;
  category: string;
  readCount: number;
  likeCount: number;
  createdAt: string;
  coverImageUrl: string;
  fileType: string;
  fileUrl: string;
}

export interface CommentUser {
  _id?: string;
  username: string;
  firstName: string;
  lastName: string;
  imageURL?: string;
}

export interface StoryReply {
  _id: string;
  userId: CommentUser;
  username: string; // Kept for backward compatibility
  text: string;
  firstName?: string;
  lastName?: string;
  userImage?: string;
  likes?: (CommentUser | string)[]; // Array of users or user IDs who liked this reply
  createdAt: Date;
}
export interface StoryComment {
  _id?: string;
  userId: CommentUser;
  username: string; // Kept for backward compatibility
  text: string;
  firstName?: string;
  lastName?: string;
  userImage?: string;
  likes?: (CommentUser | string)[]; // Array of users or user IDs who liked this comment
  replies?: StoryReply[]; // Array of replies to this comment
  createdAt: Date;
}
export interface IUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: "child" | "teacher" | "admin";

  email: string;
  emailVerified: boolean;
  profilePicture?: string;
  subscription: ISubscription;
  birthDate?: Date;
  age: number;
  ninjaLevel: number;
  ninjaGold: number;
  acheivments: string;
  storiesUploaded: number;
  storiesRead: number;
  totalReads: number;

  // comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ISubscription {
  paymentID: string;
  packageID: string;
  email?: string;
  subscribed: boolean;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date; // Because of timestamps: true
}

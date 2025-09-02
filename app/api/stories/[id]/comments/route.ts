import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { content } = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid story ID" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: "Comment is too long" },
        { status: 400 }
      );
    }

    // Verify story exists
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Get or create default user for comments
    let defaultUser = await UserModel.findOne({ email: "default@writingninja.com" });
    
    if (!defaultUser) {
      defaultUser = new UserModel({
        firstName: "Demo",
        lastName: "User",
        username: "demouser",
        email: "default@writingninja.com",
        password: "defaultpassword123",
        age: 25,
        role: "user"
      });
      await defaultUser.save();
    }

    // Create and save comment
    const newComment = new Comment({
      story: id,
      author: defaultUser._id,
      authorName: `${defaultUser.firstName} ${defaultUser.lastName}`,
      content: content.trim(),
      isApproved: true
    });

    const savedComment = await newComment.save();

    // Update story comment count
    await Story.findByIdAndUpdate(id, {
      $inc: { commentCount: 1 }
    });

    return NextResponse.json(savedComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid story ID" },
        { status: 400 }
      );
    }

    // Verify story exists
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Fetch comments for this story
    const comments = await Comment.find({ 
      story: id, 
      isApproved: true 
    })
    .populate('author', 'firstName lastName username profilePicture')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
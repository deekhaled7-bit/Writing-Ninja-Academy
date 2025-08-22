import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongodb";
import Comment from "../../../../../models/Comment";
import Story from "../../../../../models/Story";
import User from "../../../../../models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  // For demo purposes, we'll use a default user ID
  const defaultUserId = "65f4b0b0f0b0b0b0b0b0b0b0";

  await dbConnect();

  try {
    const { content } = await request.json();

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
    const story = await Story.findById(resolvedParams.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Get user info (or create a default user for demo)
    let user = await User.findById(defaultUserId);
    if (!user) {
      // Create a default user for demo purposes
      user = await User.create({
        _id: defaultUserId,
        name: "Demo User",
        email: "demo@example.com",
        ninjaLevel: 1,
        ninjaGold: 100,
        storiesUploaded: 0
      });
    }

    // Create comment
    const comment = await Comment.create({
      story: resolvedParams.id,
      author: defaultUserId,
      authorName: user.name,
      content: content.trim(),
    });

    // Increment comment count on story
    await Story.findByIdAndUpdate(resolvedParams.id, {
      $inc: { commentCount: 1 },
    });

    // Award ninja gold for commenting
    await User.findByIdAndUpdate(defaultUserId, {
      $inc: { ninjaGold: 1 },
    });

    return NextResponse.json(
      {
        _id: comment._id,
        author: comment.author,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
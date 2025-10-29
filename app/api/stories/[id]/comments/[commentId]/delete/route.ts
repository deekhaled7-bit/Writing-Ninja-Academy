import { NextResponse } from "next/server";
import { ConnectDB } from "@/config/db";
import Story from "@/models/Story";
import InteractionsModel from "@/models/interactionsModel";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Connect to database
    await ConnectDB();

    // Get the current user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id, commentId } = await params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return NextResponse.json(
        { error: "Invalid story or comment ID" },
        { status: 400 }
      );
    }

    // Find the story and comment
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Find the comment
    const comment = story.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment from the story
    await Story.findByIdAndUpdate(id, {
      $pull: { comments: { _id: new mongoose.Types.ObjectId(commentId) } },
    });

    // Delete the interaction record
    await InteractionsModel.deleteMany({
      targetType: "story",
      actionType: "comment",
      targetId: id,
      userId: userId,
      "metadata.commentId": commentId,
    });

    // Also delete any interactions related to this comment (likes, replies)
    await InteractionsModel.deleteMany({
      targetType: "comment",
      targetId: commentId,
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

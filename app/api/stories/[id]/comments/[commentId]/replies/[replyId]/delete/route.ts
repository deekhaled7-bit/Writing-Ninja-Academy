import { NextResponse } from "next/server";
import { ConnectDB } from "@/config/db";
import Story from "@/models/Story";
import InteractionsModel from "@/models/interactionsModel";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; commentId: string; replyId: string }>;
  }
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
    const { id, commentId, replyId } = await params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId) ||
      !mongoose.Types.ObjectId.isValid(replyId)
    ) {
      return NextResponse.json(
        { error: "Invalid story, comment, or reply ID" },
        { status: 400 }
      );
    }

    // Find the story
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

    // Find the reply
    const reply = comment.replies.find(
      (r: any) => r._id.toString() === replyId
    );

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    // Check if the user is the owner of the reply
    if (reply.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own replies" },
        { status: 403 }
      );
    }

    // Delete the reply from the comment
    await Story.updateOne(
      { _id: id, "comments._id": new mongoose.Types.ObjectId(commentId) },
      {
        $pull: {
          "comments.$.replies": { _id: new mongoose.Types.ObjectId(replyId) },
        },
      }
    );

    // Delete the interaction record
    await InteractionsModel.deleteMany({
      targetType: "comment",
      actionType: "reply",
      targetId: commentId,
      userId: userId,
      replyId: replyId,
    });

    // Also delete any interactions related to this reply (likes)
    await InteractionsModel.deleteMany({
      targetType: "reply",
      targetId: replyId,
    });

    return NextResponse.json(
      { message: "Reply deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting reply:", error);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}

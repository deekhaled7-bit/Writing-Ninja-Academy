import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";
import mongoose from "mongoose";

// POST - Like/Unlike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // if (!user.isSubscribed) {
    //   return NextResponse.json(
    //     { error: "Subscription required to like comments" },
    //     { status: 403 }
    //   );
    // }

    const userId = user._id.toString();

    // Find the story and check if the comment exists
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Find the comment in the story
    if (!story.comments) {
      return NextResponse.json({ error: "No comments found" }, { status: 404 });
    }

    const comment = story.comments.id
      ? story.comments.id(commentId)
      : story.comments.find(
          (c: any) => c._id && c._id.toString() === commentId
        );
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user already liked the comment
    const alreadyLiked =
      comment.likes &&
      comment.likes.some((like: any) =>
        like._id ? like._id.toString() === userId : like.toString() === userId
      );

    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter((like: any) =>
        like._id ? like._id.toString() !== userId : like.toString() !== userId
      );
    } else {
      // Like the comment
      if (!comment.likes) {
        comment.likes = [];
      }
      comment.likes.push(new mongoose.Types.ObjectId(userId));
    }

    // Save the updated story
    await story.save();

    // Record the interaction for admin dashboard and notifications
    const { parentId, parentType } = await request.json();
    // Find the playlist that contains this story
    // const findPlaylistByid = async (id: string) => {
    //   try {
    //     const playlist = await playlistModel.findOne({ storys: id });
    //     return playlist?._id || null;
    //   } catch (error) {
    //     console.error("Error finding playlist by story ID:", error);
    //     return null;
    //   }
    // };
    // // Get the playlist ID for this story
    // const playlistId = await findPlaylistByid(id);

    // Get the comment owner's ID to notify them
    const commentOwnerId = comment.userId.toString();

    await InteractionsModel.create({
      userId: userId,
      notifyUserId: commentOwnerId,
      broadcast: false,
      link: `${process.env.baseUrl}stories/${id}`,
      targetId: commentId,
      targetType: "comment",
      actionType: alreadyLiked ? "unlike" : "like",
      parentId: parentId || id,
      parentType: "story",
      read: false,
    });

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
    });
  } catch (error: any) {
    console.error("Error handling comment like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";

// POST - Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Reply text is required" },
        { status: 400 }
      );
    }

    // Check if user is subscribed directly from session
    // if (!session.user.isSubscribed) {
    //   return NextResponse.json(
    //     { error: "Subscription required to reply to comments" },
    //     { status: 403 }
    //   );
    // }

    // Find the story
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Find the comment
    if (!story.comments) {
      return NextResponse.json({ error: "No comments found" }, { status: 404 });
    }

    const comment = story.comments.id
      ? story.comments.id(commentId)
      : story.comments.find((c: any) =>
          c._id && c._id.toString
            ? c._id.toString() === commentId
            : c._id === commentId
        );
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Create the reply with additional fields to match storyComment structure
    const newReply = {
      userId: session.user.id,
      username: session.user.name || "",
      text: text.trim(),
      likes: [],
      createdAt: new Date(),
    };

    // Add the reply to the comment
    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push(newReply);
    await story.save();

    // Get the newly added reply with its ID from the database
    const savedReply = comment.replies[comment.replies.length - 1];
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
    // Record the reply interaction
    // const { parentId, parentType } = await request.json();
    await InteractionsModel.create({
      notifyUserId: comment.userId,
      link: `${process.env.baseUrl}stories/${id}`,
      userId: session.user.id,
      targetId: commentId,
      targetType: "comment",
      actionType: "reply",
      parentId: id,
      parentType: "story",
      replyId: savedReply._id,
      content: text.trim(),
      read: false,
    });

    // Prepare the response with properly structured user data and the database ID
    const replyWithUserData = {
      ...newReply,
      _id: savedReply._id.toString(), // Include the actual database ID
      userId: {
        _id: session.user.id,
        username: session.user.name || "",
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        imageURL: session.user.image || "",
      },
    };

    return NextResponse.json({
      success: true,
      reply: replyWithUserData,
    });
  } catch (error: any) {
    console.error("Error adding reply to comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

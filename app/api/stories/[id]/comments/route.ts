import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";

// GET - Get all comments for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ConnectDB();
    console.log("registering userModal" + UserModel);
    // Find the video with populated user data
    const story = await Story.findById(id)
      .populate({
        path: "comments.userId",
        model: "User",
        select: "username firstName lastName profilePicture",
        options: { strictPopulate: false },
      })
      .populate({
        path: "comments.likes",
        model: "User",
        select: "username firstName lastName profilePicture",
        options: { strictPopulate: false },
      })
      .populate({
        path: "comments.replies.userId",
        model: "User",
        select: "username firstName lastName profilePicture",
        options: { strictPopulate: false },
      })
      .populate({
        path: "comments.replies.likes",
        model: "User",
        select: "username firstName lastName profilePicture",
        options: { strictPopulate: false },
      })
      .lean();

    if (!story) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Transform populated data to maintain API compatibility
    const storyData = story as any; // Type assertion to access comments
    // First map comments to add user details
    const mappedComments = (storyData.comments || []).map((comment: any) => {
      console.log("commentID" + comment._id);
      const userData = comment.userId || {};

      // Process replies to add user details and sort by createdAt
      const repliesWithUserDetails = (comment.replies || [])
        .map((reply: any) => {
          const replyUserData = reply.userId || {};
          return {
            ...reply,
            userImage: replyUserData.profilePicture || "",
            firstName: replyUserData.firstName || "",
            lastName: replyUserData.lastName || "",
            // Keep userId as a string reference for backward compatibility
            userId: reply.userId?._id?.toString() || reply.userId,
          };
        })
        // Sort replies by createdAt date (newest first)
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      return {
        ...comment,
        userImage: userData.profilePicture || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        // Keep userId as a string reference for backward compatibility
        userId: comment.userId?._id?.toString() || comment.userId,
        // Replace replies with the processed and sorted ones
        replies: repliesWithUserDetails,
      };
    });

    // Then sort the comments by createdAt date (newest first)
    const commentsWithUserDetails = mappedComments.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithUserDetails || [],
    });
  } catch (error: any) {
    console.error("Error getting video comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a comment to a video
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const { text, parentId, parentType } = await request.json();

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is subscribed and subscription hasn't expired
    const today = new Date();
    // if (
    //   !user.isSubscribed ||
    //   (user.expiryDate && new Date(user.expiryDate) < today)
    // ) {
    //   return NextResponse.json(
    //     { error: "Active subscription required to comment on videos" },
    //     { status: 403 }
    //   );
    // }

    // Find the video
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Create the comment
    const newComment = {
      userId: user._id.toString(),
      username: user.username,
      text: text.trim(),
      likes: [],
      replies: [],
      createdAt: new Date(),
    };

    // Add the comment to the video
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true }
    );

    // Get the newly created comment with its ID
    const createdComment =
      updatedStory.comments[updatedStory.comments.length - 1];

    // Find the playlist that contains this video

    // Record the interaction for admin dashboard and notifications
    await InteractionsModel.create({
      userId: user._id,
      notifyUserId: story.author,
      broadcast: false,
      targetId: id,
      targetType: "story",
      link: `${process.env.baseUrl}stories/${id}`,
      actionType: "comment",
      content: text.trim(),
      read: false,
      parentId: parentId || id,
      parentType: "story",
    });

    // Prepare the comment with user data according to VideoComment interface
    const commentWithUserData = {
      ...createdComment.toObject(),
      _id: createdComment._id,
      userId: {
        _id: user._id.toString(),
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageURL: user.profilePicture || "",
      },
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      userImage: user.profilePicture || "",
    };

    return NextResponse.json({
      success: true,
      comment: commentWithUserData,
      commentsCount: updatedStory.comments ? updatedStory.comments.length : 0,
    });
  } catch (error: any) {
    console.error("Error adding video comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";
import mongoose from "mongoose";

// POST - Like/Unlike a story
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

    // Check if user is subscribed
    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // if (!user.isSubscribed) {
    //   return NextResponse.json(
    //     { error: "Subscription required to like storys" },
    //     { status: 403 }
    //   );
    // }

    const userId = user._id;
    console.log("registering userModal" + UserModel);

    // Find the story and populate user information for likes
    let story = await Story.findById(id).populate({
      path: "likes",
      model: "User",
      select: "username firstName lastName imageURL",
    });
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Initialize likes array if it doesn't exist
    if (!story.likes) {
      story.likes = [];
    }

    // Check if user already liked the story
    console.log("userId:", userId, "type:", typeof userId);
    const alreadyLiked = story.likes.some((like: any) => {
      console.log("id in likes array:", like, "type:", typeof like);
      return like._id.toString() === userId.toString();
    });

    if (alreadyLiked) {
      // Unlike the story
      console.log("alreadyLiked" + alreadyLiked);
      story.likes = story.likes.filter(
        (like: any) => like._id.toString() !== userId.toString()
      );
    } else {
      // Like the story
      story.likes.push(new mongoose.Types.ObjectId(userId));
    }

    // Save the updated story with retry logic for version conflicts
    let retries = 3;
    let saved = false;

    while (retries > 0 && !saved) {
      try {
        await story.save();

        // Record the interaction for admin dashboard and notifications
        const { parentId, parentType } = await request.json();
        // const findPlaylistBystoryId = async (storyId: string) => {
        //   try {
        //     const playlist = await playlistModel.findOne({ storys: storyId });
        //     return playlist?._id || null;
        //   } catch (error) {
        //     console.error("Error finding playlist by story ID:", error);
        //     return null;
        //   }
        // };

        // // Get the playlist ID for this story
        // const playlistId = await findPlaylistBystoryId(storyId);
        await InteractionsModel.create({
          userId: userId,
          notifyUserId: story.author,
          broadcast: false,
          link: `${process.env.baseUrl}/stories/${id}`,
          targetId: id,
          targetType: "story",
          actionType: alreadyLiked ? "unlike" : "like",
          parentId: id,
          parentType: "story",
          read: false,
        });

        saved = true;
      } catch (saveError: any) {
        if (saveError.name === "VersionError" && retries > 1) {
          console.log(
            `Version conflict detected, retrying... (${
              retries - 1
            } attempts left)`
          );
          // Refetch the latest version of the document
          const updatedStory = await Story.findById(id);
          if (!updatedStory) {
            throw new Error("Story not found during retry");
          }

          // Re-apply our changes to the fresh document
          if (alreadyLiked) {
            updatedStory.likes = updatedStory.likes.filter(
              (like: any) => like._id.toString() !== userId.toString()
            );
          } else {
            updatedStory.likes.push(new mongoose.Types.ObjectId(userId));
          }

          story = updatedStory;
          retries--;
        } else {
          // If it's not a version error or we're out of retries, rethrow
          throw saveError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: story.likes.length,
    });
  } catch (error: any) {
    console.error("Error handling story like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

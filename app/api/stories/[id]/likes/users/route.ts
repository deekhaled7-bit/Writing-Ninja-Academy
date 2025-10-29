import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import { ConnectDB } from "@/config/db";

// GET - Get users who liked a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { error: "Authentication required" },
    //     { status: 401 }
    //   );
    // }

    const { id } = await params;

    // Find the story
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json({ error: "story not found" }, { status: 404 });
    }

    // Get the user IDs who liked the story
    const likeUserIds = story.likes || [];

    if (likeUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    // Find the users who liked the story
    const users = await UserModel.find(
      { _id: { $in: likeUserIds } },
      "username firstName lastName profilePicture"
    );

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        _id: user._id,
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userImage: user.profilePicture || "",
      })),
    });
  } catch (error: any) {
    console.error("Error getting users who liked story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

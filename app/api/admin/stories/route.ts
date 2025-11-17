import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    // Get session to check user role
    const session = await getServerSession(authOptions);

    // Only allow admins to access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Fetch all stories regardless of publication status
    const stories = await Story.find({})
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching stories for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// Update story status
export async function PUT(request: NextRequest) {
  console.log("registering" + UserModel);
  try {
    // Get session to check user role
    const session = await getServerSession(authOptions);

    // Only allow admins to access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { storyId, status } = await request.json();

    if (!storyId || !status) {
      return NextResponse.json(
        { error: "Story ID and status are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update the story status
    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      {
        status,
        isPublished: status === "published",
      },
      { new: true }
    ).populate("author", "_id firstName lastName email");

    await UserModel.findByIdAndUpdate(updatedStory.author._id, {
      $inc: { storiesUploaded: 1 },
    });

    if (!updatedStory) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ story: updatedStory });
  } catch (error) {
    console.error("Error updating story status:", error);
    return NextResponse.json(
      { error: "Failed to update story status" },
      { status: 500 }
    );
  }
}

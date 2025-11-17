import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";



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
    
    const story = await Story.findById(id)
      .populate('author', 'firstName lastName username profilePicture ninjaLevel storiesUploaded')
      .lean();
    
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { action } = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid story ID" },
        { status: 400 }
      );
    }

    // Update story based on action
    let updateField = {};
    switch (action) {
      case 'read':
        updateField = { $inc: { readCount: 1 } };
        break;
      case 'like':
        updateField = { $inc: { likeCount: 1 } };
        break;
      case 'complete':
        updateField = { $inc: { completedCount: 1 } };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    const updatedStory = await Story.findByIdAndUpdate(
      id,
      updateField,
      { new: true }
    );

    if (!updatedStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, story: updatedStory });
  } catch (error) {
    console.error("Error updating story interaction:", error);
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid story ID" },
        { status: 400 }
      );
    }
    
    // Find and delete the story
    const deletedStory = await Story.findByIdAndDelete(id);
    
    if (!deletedStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Story deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}

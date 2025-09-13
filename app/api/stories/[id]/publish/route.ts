import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await dbConnect();

    // Find the story by ID
    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Update the story status to published
    story.isPublished = true;
    story.status = "published";
    await story.save();

    return NextResponse.json({
      message: "Story published successfully",
      story: {
        id: story._id,
        title: story.title,
        status: story.status,
        isPublished: story.isPublished
      }
    });
  } catch (error: any) {
    console.error("Error publishing story:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish story" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    // Connect to database
    await connectDB();

    // Get request body
    const { featured } = await request.json();

    // Update story featured status
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    if (!updatedStory) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Story featured status updated successfully",
        story: updatedStory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating story featured status:", error);
    return NextResponse.json(
      { error: "Failed to update story featured status" },
      { status: 500 }
    );
  }
}

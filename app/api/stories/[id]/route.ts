import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Story from "../../../../models/Story";
import Comment from "../../../../models/Comment";
import Interaction from "../../../../models/Interaction";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  await dbConnect();

  try {
    const story = await Story.findById(resolvedParams.id)
      .populate("author", "name profilePicture ninjaLevel")
      .lean();

    // if (!story || !story.isPublished) {
    //   return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    // }

    // Get comments
    const comments = await Comment.find({
      story: resolvedParams.id,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ story, comments });
  } catch (error) {
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
  const resolvedParams = await params;
  // For demo purposes, we'll use a default user ID
  const defaultUserId = "65f4b0b0f0b0b0b0b0b0b0b0";

  await dbConnect();

  try {
    const { action } = await request.json();

    if (action === "read") {
      // Track read interaction
      await Interaction.findOneAndUpdate(
        { user: defaultUserId, story: resolvedParams.id, type: "read" },
        { user: defaultUserId, story: resolvedParams.id, type: "read" },
        { upsert: true }
      );

      // Increment read count
      await Story.findByIdAndUpdate(resolvedParams.id, {
        $inc: { readCount: 1 },
      });
    } else if (action === "completed") {
      // Track completion
      await Interaction.findOneAndUpdate(
        { user: defaultUserId, story: resolvedParams.id, type: "completed" },
        { user: defaultUserId, story: resolvedParams.id, type: "completed" },
        { upsert: true }
      );

      // Increment completed count
      await Story.findByIdAndUpdate(resolvedParams.id, {
        $inc: { completedCount: 1 },
      });
    } else if (action === "like") {
      // Toggle like
      const existingLike = await Interaction.findOne({
        user: defaultUserId,
        story: resolvedParams.id,
        type: "liked",
      });

      if (existingLike) {
        await Interaction.findByIdAndDelete(existingLike._id);
        await Story.findByIdAndUpdate(resolvedParams.id, {
          $inc: { likeCount: -1 },
        });
      } else {
        await Interaction.create({
          user: defaultUserId,
          story: resolvedParams.id,
          type: "liked",
        });
        await Story.findByIdAndUpdate(resolvedParams.id, {
          $inc: { likeCount: 1 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

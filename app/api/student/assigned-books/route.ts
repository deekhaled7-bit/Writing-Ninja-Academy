import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import BookAssignment from "@/models/BookAssignment";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/config/db";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await ConnectDB();

    // Get the student ID from the session
    const studentId = session.user.id;

    // Find all assignments for this student or their class
    console.log("resgisteringModels" + Story + UserModel);
    const assignments = await BookAssignment.find({
      $or: [
        { studentId: studentId },
        {
          classId: { $in: (session.user as any).classes || [] },
          studentId: null, // Class-wide assignments have null studentId
        },
      ],
    })
      .populate({
        path: "storyId",
        select: "_id title coverImageUrl",
        model: "Story",
      })
      .populate({
        path: "teacherId",
        select: "_id firstName lastName",
        model: "User",
      })
      .sort({ assignedDate: -1 });

    // Transform the data to match the expected BookAssignment type
    const formattedAssignments = assignments.map((assignment) => ({
      _id: assignment._id.toString(),
      title: assignment.title,
      assignedDate: assignment.assignedDate,
      dueDate: assignment.dueDate,
      isCompleted: assignment.isCompleted,
      readingProgress: assignment.readingProgress,
      lastReadDate: assignment.lastReadDate,
      story: {
        _id: assignment.storyId._id.toString(),
        title: assignment.storyId.title,
        coverImage: assignment.storyId.coverImageUrl,
      },
      teacher: {
        _id: assignment.teacherId._id.toString(),
        name:
          assignment.teacherId.firstName + " " + assignment.teacherId.lastName,
      },
    }));
    console.log("test" + formattedAssignments[0].story.coverImage);
    return NextResponse.json({ assignments: formattedAssignments });
  } catch (error) {
    console.error("Error fetching assigned books:", error);
    return NextResponse.json(
      { message: "Failed to fetch assigned books" },
      { status: 500 }
    );
  }
}

// Update reading progress
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await ConnectDB();

    // Get the request body
    const { assignmentId, progress, isCompleted = false } = await req.json();

    if (!assignmentId || progress === undefined) {
      return NextResponse.json(
        { message: "Assignment ID and progress are required" },
        { status: 400 }
      );
    }

    // Get the student ID from the session
    const studentId = session.user.id;

    // Find the assignment
    const assignment = await BookAssignment.findOne({
      _id: assignmentId,
      $or: [
        { studentId: studentId },
        {
          classId: { $in: (session.user as any).classes || [] },
          studentId: null, // Class-wide assignments
        },
      ],
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    // Update the assignment
    assignment.readingProgress = progress;
    assignment.lastReadDate = new Date();

    if (isCompleted || progress >= 100) {
      assignment.isCompleted = true;
      assignment.readingProgress = 100;
    }

    await assignment.save();

    return NextResponse.json({
      message: "Reading progress updated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error updating reading progress:", error);
    return NextResponse.json(
      { message: "Failed to update reading progress" },
      { status: 500 }
    );
  }
}

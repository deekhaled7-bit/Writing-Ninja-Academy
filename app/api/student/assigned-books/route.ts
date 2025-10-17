import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import BookAssignment from "@/models/BookAssignment";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/config/db";

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
    const assignments = await BookAssignment.aggregate([
      {
        $match: {
          $or: [
            { studentId: new mongoose.Types.ObjectId(studentId) },
            {
              classId: { $in: (session.user as any).classes || [] },
              studentId: null, // Class-wide assignments have null studentId
            },
          ],
        },
      },
      {
        $lookup: {
          from: "stories",
          localField: "storyId",
          foreignField: "_id",
          as: "story",
        },
      },
      {
        $unwind: {
          path: "$story",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          assignedDate: 1,
          dueDate: 1,
          isCompleted: 1,
          readingProgress: 1,
          lastReadDate: 1,
          "story._id": 1,
          "story.title": 1,
          "story.coverImage": 1,
          "teacher._id": 1,
          "teacher.name": 1,
        },
      },
      {
        $sort: { assignedDate: -1 },
      },
    ]);

    return NextResponse.json({ assignments });
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
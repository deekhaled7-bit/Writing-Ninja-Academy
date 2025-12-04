import { NextRequest, NextResponse } from "next/server";
import BookAssignment from "@/models/BookAssignment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ConnectDB } from "@/config/db";
import UserModel from "@/models/userModel";
import Story from "@/models/Story";

// POST: Assign a book to student(s)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();
    const {
      classId,
      studentId, // Optional - if null, assign to entire class
      storyId,
      title,
      dueDate, // Optional
    } = await req.json();

    // Validate required fields
    if (!classId || !storyId || !title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // If studentId is "all" or null, assign to all students in the class
    if (studentId === "all" || !studentId) {
      // Find all students in this class
      const students = await UserModel.find({
        assignedClasses: { $in: [classId] },
        role: "student",
      }).select("_id");

      if (students.length === 0) {
        return NextResponse.json(
          { message: "No students found in this class" },
          { status: 404 }
        );
      }

      // Create assignments for each student
      const assignmentPromises = students.map((student) =>
        BookAssignment.create({
          teacherId: session.user.id,
          classId,
          studentId: student._id,
          storyId,
          title,
          dueDate: dueDate || null,
          assignedDate: new Date(),
          isCompleted: false,
          readingProgress: 0,
          lastReadDate: null,
        })
      );

      await Promise.all(assignmentPromises);

      return NextResponse.json({
        success: true,
        message: `Book assigned successfully to ${students.length} students`,
      });
    }

    // Create assignment for a single student
    const assignment = await BookAssignment.create({
      teacherId: session.user.id,
      classId,
      studentId,
      storyId,
      title,
      dueDate: dueDate || null,
      assignedDate: new Date(),
      isCompleted: false,
      readingProgress: 0,
      lastReadDate: null,
    });

    return NextResponse.json({
      success: true,
      message: "Book assigned successfully",
      assignment,
    });
  } catch (error: any) {
    console.error("Error assigning book:", error);
    return NextResponse.json(
      { message: error.message || "Failed to assign book" },
      { status: 500 }
    );
  }
}

// GET: Get all assignments for a teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    // Get query parameters
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const studentId = url.searchParams.get("studentId");

    // Build query
    const query: any = { teacherId: session.user.id };
    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;
    console.log("registering" + Story);

    // Get assignments with populated references
    const assignments = await BookAssignment.find(query)
      .populate("studentId", "firstName lastName username email profilePicture")
      .populate("storyId", "title _id coverImage")
      .sort({ assignedDate: -1 });

    // Filter out assignments where the story or student has been deleted
    const validAssignments = assignments.filter(
      (assignment) => assignment.storyId && assignment.studentId
    );

    console.log(
      validAssignments.length +
        " valid assignments out of " +
        assignments.length
    );

    return NextResponse.json({
      success: true,
      assignments: validAssignments,
    });
  } catch (error: any) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// DELETE: Delete assignments by title and storyId
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { title, storyId } = await req.json();

    // Validate required fields
    if (!title || !storyId) {
      return NextResponse.json(
        { message: "Missing required fields: title and storyId" },
        { status: 400 }
      );
    }

    // Delete all assignments with matching title and storyId for this teacher
    const result = await BookAssignment.deleteMany({
      teacherId: session.user.id,
      title: title,
      storyId: storyId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "No assignments found with the given title and storyId" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} assignments`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Error deleting assignments:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete assignments" },
      { status: 500 }
    );
  }
}

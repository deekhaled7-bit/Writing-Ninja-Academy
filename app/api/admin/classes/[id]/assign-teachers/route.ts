import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

// POST assign teachers to a class
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { teacherIds } = body;

    // Validate teacherIds
    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return NextResponse.json(
        { error: "Teacher IDs array is required" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classData = await ClassModel.findById(id);

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Validate teacher IDs and check if they exist
    for (const teacherId of teacherIds) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return NextResponse.json(
          { error: `Invalid teacher ID format: ${teacherId}` },
          { status: 400 }
        );
      }

      const teacher = await UserModel.findById(teacherId);

      if (!teacher) {
        return NextResponse.json(
          { error: `Teacher with ID ${teacherId} not found` },
          { status: 404 }
        );
      }

      if (teacher.role !== "teacher") {
        return NextResponse.json(
          { error: `User with ID ${teacherId} is not a teacher` },
          { status: 400 }
        );
      }
    }

    // Get current teachers from UserModel since teachers are now stored there
    const currentTeachers = await UserModel.find({
      assignedClasses: id,
      role: "teacher"
    }).select("_id");
    
    const currentTeacherIds = currentTeachers.map(
      (teacher: any) => teacher._id.toString()
    );

    // Find teachers to add and remove
    const teachersToAdd = teacherIds.filter(
      (id: string) => !currentTeacherIds.includes(id)
    );
    const teachersToRemove = currentTeacherIds.filter(
      (id: string) => !teacherIds.includes(id)
    );

    // We no longer update the class with teachers since the relationship is now stored in UserModel

    // Add class to new teachers' assignedClasses
    if (teachersToAdd.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: teachersToAdd } },
        { $addToSet: { assignedClasses: id } }
      );
    }

    // Remove class from removed teachers' assignedClasses
    if (teachersToRemove.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: teachersToRemove } },
        { $pull: { assignedClasses: id } }
      );
    }

    // Get updated class
    const updatedClass = await ClassModel.findById(id);
    
    // Get assigned teachers from UserModel
    const assignedTeachers = await UserModel.find({
      assignedClasses: id,
      role: "teacher"
    }).select("firstName lastName email");

    return NextResponse.json(
      {
        message: "Teachers assigned successfully",
        class: updatedClass,
        teachers: assignedTeachers
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning teachers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign teachers" },
      { status: 500 }
    );
  }
}

// GET teachers assigned to a class
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classData = await ClassModel.findById(id);

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    
    // Get assigned teachers from UserModel
    const assignedTeachers = await UserModel.find({
      assignedClasses: id,
      role: "teacher"
    }).select("_id firstName lastName email");

    return NextResponse.json(
      {
        teachers: assignedTeachers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching assigned teachers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch assigned teachers" },
      { status: 500 }
    );
  }
}

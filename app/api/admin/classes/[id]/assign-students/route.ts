import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

// POST assign students to a class
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
    const { studentIds } = body;

    // Validate studentIds
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs array is required" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classData = await ClassModel.findById(id);

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Validate student IDs and check if they exist
    for (const studentId of studentIds) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return NextResponse.json(
          { error: `Invalid student ID format: ${studentId}` },
          { status: 400 }
        );
      }

      const student = await UserModel.findById(studentId);

      if (!student) {
        return NextResponse.json(
          { error: `Student with ID ${studentId} not found` },
          { status: 404 }
        );
      }

      if (student.role !== "student") {
        return NextResponse.json(
          { error: `User with ID ${studentId} is not a student` },
          { status: 400 }
        );
      }
    }

    // Get current students from UserModel since students are now stored there
    const currentStudents = await UserModel.find({
      assignedClasses: id,
      role: "student"
    }).select("_id");
    
    const currentStudentIds = currentStudents.map(
      (student: any) => student._id.toString()
    );

    // Find students to add and remove
    const studentsToAdd = studentIds.filter(
      (id: string) => !currentStudentIds.includes(id)
    );
    const studentsToRemove = currentStudentIds.filter(
      (id: string) => !studentIds.includes(id)
    );

    // We no longer update the class with students since the relationship is now stored in UserModel

    // Add class to new students' assignedClasses
    if (studentsToAdd.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: studentsToAdd } },
        { $addToSet: { assignedClasses: id } }
      );
    }

    // Remove class from removed students' assignedClasses
    if (studentsToRemove.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: studentsToRemove } },
        { $pull: { assignedClasses: id } }
      );
    }

    // Get updated class
    const updatedClass = await ClassModel.findById(id);
    
    // Get assigned students from UserModel
    const assignedStudents = await UserModel.find({
      assignedClasses: id,
      role: "student"
    }).select("firstName lastName email");

    return NextResponse.json(
      {
        message: "Students assigned successfully",
        class: updatedClass,
        students: assignedStudents
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign students" },
      { status: 500 }
    );
  }
}

// GET students assigned to a class
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
    
    // Get assigned students from UserModel
    const assignedStudents = await UserModel.find({
      assignedClasses: id,
      role: "student"
    }).select("_id firstName lastName email");

    return NextResponse.json(
      {
        students: assignedStudents,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching assigned students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch assigned students" },
      { status: 500 }
    );
  }
}
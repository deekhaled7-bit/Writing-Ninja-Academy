import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a teacher
    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Access denied. Teacher role required." },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get teacher ID from session
    const teacherId = session.user.id;

    // Validate class ID
    const resolvedParams = await context.params;
    const { id } = resolvedParams;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    // Check if teacher has access to this class
    const teacher = await UserModel.findById(teacherId);
    if (
      !teacher ||
      !teacher.assignedClasses ||
      !teacher.assignedClasses.some((classId: any) => classId.toString() === id)
    ) {
      return NextResponse.json(
        { error: "Class not found or you do not have access to this class" },
        { status: 404 }
      );
    }

    // Find the class and populate grade and students
    const classData = await ClassModel.findById(id)
      .populate("grade", "gradeNumber name")
      .lean();

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Get students assigned to this class
    const students = await UserModel.find({
      assignedClasses: id,
      role: "student",
    }).select("firstName lastName email").lean();

    // Add students to class data
    const classWithStudents = {
      ...classData,
      students: students,
    };

    return NextResponse.json({ class: classWithStudents });
  } catch (error: any) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Failed to fetch class details" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import mongoose from "mongoose";
import { ConnectDB } from "@/config/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    await ConnectDB();

    // Get teacher ID from session
    const teacherId = session.user.id;

    // Validate class ID
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    // Find the class and check if the teacher is assigned to it
    const classData = await ClassModel.findOne({
      _id: id,
      teachers: teacherId,
    })
      .populate("grade", "gradeNumber name")
      .populate("students", "firstName lastName email")
      .lean();

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or you do not have access to this class" },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Failed to fetch class details" },
      { status: 500 }
    );
  }
}
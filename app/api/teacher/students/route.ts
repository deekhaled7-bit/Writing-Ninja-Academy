import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import UserModel from "@/models/userModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";

// GET students in a class (only accessible by assigned teachers)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    // Check if user is a teacher
    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    // Get class ID from search params
    const searchParams = req.nextUrl.searchParams;
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get teacher's ID from session
    const teacherId = session.user.id;

    // Check if teacher is assigned to this class
    const teacher = await UserModel.findOne({
      _id: teacherId,
      role: "teacher",
      assignedClasses: { $in: [classId] },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Unauthorized. You do not have access to this class." },
        { status: 403 }
      );
    }

    // Get students from UserModel who have this class in their assignedClasses array
    const students = await UserModel.find({
      assignedClasses: { $in: [classId] },
      role: "student",
    }).select("_id firstName lastName email profilePicture");
    console.log("number of studnets" + students.length);
    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class students" },
      { status: 500 }
    );
  }
}

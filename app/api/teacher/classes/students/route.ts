import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
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

    // Get class ID from search params
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get teacher's ID from session
    const userId = session.user.id;
    const userRole = session.user.role;

    // Find the class
    const classData = await ClassModel.findById(id);

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if user is admin or an assigned teacher
    const isAdmin = userRole === "admin";
    // Since teachers are now stored in UserModel with assignedClasses
    const isAssignedTeacher =
      userRole === "teacher" &&
      (await UserModel.findOne({
        _id: userId,
        role: "teacher",
        assignedClasses: id,
      }).exec()) !== null;

    if (!isAdmin && !isAssignedTeacher) {
      return NextResponse.json(
        { error: "Unauthorized. You do not have access to this class." },
        { status: 403 }
      );
    }

    // Get class data for response with grade information
    const classWithGrade = await ClassModel.findById(id);
    // .populate("grade", "gradeNumber name");

    // Get students from UserModel who have this class in their assignedClasses
    const students = await UserModel.find({
      assignedClasses: id,
      role: "student",
    }).select("_id firstName lastName email age profilePicture");

    return NextResponse.json(
      {
        class: {
          _id: classWithGrade._id,
          className: classWithGrade.className,
          grade: classWithGrade.grade,
          // Note: section and academicYear fields are no longer in the ClassModel
        },
        students: students,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch class students" },
      { status: 500 }
    );
  }
}

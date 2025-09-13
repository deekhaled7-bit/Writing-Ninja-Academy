import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import UserModel from "@/models/userModel";
import dbConnect from "@/lib/mongodb";
import mongoose, { Types } from "mongoose";

// Define interface for teacher document
interface TeacherDocument {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  email?: string;
  assignedClasses?: Types.ObjectId[];
  __v?: number;
  [key: string]: any;
}

// GET classes that the teacher has access to
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get teacher's ID from session
    const teacherId = session.user.id;

    // Get query parameters
    const url = new URL(req.url);

    // Find the teacher user with their assigned classes
    const teacher = (await UserModel.findById(
      teacherId
    ).lean()) as TeacherDocument;
    console.log("assignedClasses" + JSON.stringify(teacher));
    if (
      !teacher ||
      !teacher.assignedClasses ||
      teacher.assignedClasses.length === 0
    ) {
      return NextResponse.json({ classes: [] }, { status: 200 });
    }

    // Get the classes from the teacher's assignedClasses
    const classes = await ClassModel.find({
      _id: { $in: teacher.assignedClasses },
    })
      // .populate("grade", "gradeNumber name")
      .sort({ grade: 1 });

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching teacher's classes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teacher's classes" },
      { status: 500 }
    );
  }
}

// POST check if teacher has access to a specific class
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { classId } = body;

    // Validate classId
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: "Valid class ID is required" },
        { status: 400 }
      );
    }

    // Get teacher's ID from session
    const teacherId = session.user.id;

    // Find the teacher with their assigned classes
    const teacher = (await UserModel.findById(
      teacherId
    ).lean()) as TeacherDocument;

    if (
      !teacher ||
      !teacher.assignedClasses ||
      teacher.assignedClasses.length === 0
    ) {
      return NextResponse.json(
        {
          hasAccess: false,
          message: "You do not have access to this class",
        },
        { status: 403 }
      );
    }

    // Check if the requested class is in the teacher's assigned classes
    const hasAccess = teacher.assignedClasses.some(
      (classObjectId) => classObjectId.toString() === classId
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          hasAccess: false,
          message: "You do not have access to this class",
        },
        { status: 403 }
      );
    }

    // Get the class details
    const classAccess = await ClassModel.findById(classId);

    if (!classAccess) {
      return NextResponse.json(
        {
          hasAccess: false,
          message: "You do not have access to this class",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        hasAccess: true,
        message: "You have access to this class",
        class: classAccess,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking class access:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check class access" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/userModel";
import Story from "@/models/Story";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

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

    // Find the teacher's assigned classes
    const teacher = await UserModel.findById(teacherId);

    if (
      !teacher ||
      !teacher.assignedClasses ||
      teacher.assignedClasses.length === 0
    ) {
      return NextResponse.json({
        totalStudents: 0,
        totalStories: 0,
        pendingReviews: 0,
      });
    }

    // Find students in teacher's assigned classes
    const students = await UserModel.find({
      assignedClasses: { $in: teacher.assignedClasses },
      role: "student",
    }).select("_id");

    const studentIds = students.map((student) => student._id);

    // Get total students count
    const totalStudents = studentIds.length;

    // Get total stories by students in teacher's classes
    const totalStories = await Story.countDocuments({
      author: { $in: studentIds },
    });

    // Get pending reviews (stories that are not published and need review)
    const pendingReviews = await Story.countDocuments({
      author: { $in: studentIds },
      isPublished: false,
      status: "waiting_revision",
    });

    return NextResponse.json({
      totalStudents,
      totalStories,
      pendingReviews,
    });
  } catch (error: any) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teacher stats" },
      { status: 500 }
    );
  }
}

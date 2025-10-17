import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import UserModel from "@/models/userModel";
import ClassModel from "@/models/ClassModel";
import dbConnect from "@/lib/mongodb";
import GradeModel from "@/models/GradeModel";

// GET classes that the teacher has access to
export async function GET(req: NextRequest) {
  console.log("registering grade and class" + GradeModel + ClassModel);
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

    // Find the teacher user with their assigned classes
    const teacher = await UserModel.findById(teacherId);

    if (
      !teacher ||
      !teacher.assignedClasses ||
      teacher.assignedClasses.length === 0
    ) {
      return NextResponse.json({ classes: [] }, { status: 200 });
    }

    // Fetch classes using the array of ObjectIds
    const classes = await ClassModel.find({
      _id: { $in: teacher.assignedClasses },
    })
      .populate({
        path: "grade",
        model: "Grade",
        select: "name level",
      })
      .select("_id className grade students");
    console.log("classesLegnth" + classes.length);
    // Retcurn the populated classes
    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

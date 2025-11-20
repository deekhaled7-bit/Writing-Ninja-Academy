import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import ClassModel from "@/models/ClassModel";
import GradeModel from "@/models/GradeModel";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import userModel from "@/models/userModel";

// GET all classes
export async function GET(req: NextRequest) {
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

    // Get query parameters
    const url = new URL(req.url);
    const gradeId = url.searchParams.get("grade");

    // Build query based on parameters
    const query: any = {};
    if (gradeId && mongoose.Types.ObjectId.isValid(gradeId)) {
      query.grade = gradeId;
    }

    // Get classes with grade information
    const classes = await ClassModel.find(query)
      .populate("grade", "gradeNumber name")
      .sort({ grade: 1 });

    // Get class IDs
    const classIds = classes.map((c) => c._id);

    // Get teachers for all classes
    const teachersByClass = await userModel.aggregate([
      { $match: { role: "teacher", assignedClasses: { $in: classIds } } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          assignedClasses: 1,
        },
      },
      { $unwind: "$assignedClasses" },
      { $match: { assignedClasses: { $in: classIds } } },
      {
        $group: {
          _id: "$assignedClasses",
          teachers: {
            $push: {
              _id: "$_id",
              firstName: "$firstName",
              lastName: "$lastName",
              email: "$email",
            },
          },
        },
      },
    ]);

    // Create a map of class ID to teachers
    const teachersMap: Record<string, Array<{_id: mongoose.Types.ObjectId, firstName: string, lastName: string, email: string}>> = {};
    teachersByClass.forEach((item) => {
      teachersMap[item._id.toString()] = item.teachers;
    });

    // Add teachers to each class
    const classesWithTeachers = classes.map((c) => {
      const classObj = c.toObject();
      classObj.teachers = teachersMap[c._id.toString()] || [];
      return classObj;
    });

    return NextResponse.json({ classes: classesWithTeachers }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST create a new class
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { className, grade, teachers } = body;

    // Validate required fields
    if (!className || !grade) {
      return NextResponse.json(
        { error: "Class name and grade are required" },
        { status: 400 }
      );
    }

    // Validate grade ID
    if (!mongoose.Types.ObjectId.isValid(grade)) {
      return NextResponse.json(
        { error: "Invalid grade ID format" },
        { status: 400 }
      );
    }

    // Check if grade exists
    const gradeExists = await GradeModel.findById(grade);
    if (!gradeExists) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if class already exists for the grade with the same name
    const existingClass = await ClassModel.findOne({
      grade,
      className,
    });

    if (existingClass) {
      return NextResponse.json(
        { error: `Class with name ${className} already exists for this grade` },
        { status: 409 }
      );
    }

    // Validate teachers array if provided
    if (teachers && Array.isArray(teachers)) {
      for (const teacherId of teachers) {
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
          return NextResponse.json(
            { error: `Invalid teacher ID format: ${teacherId}` },
            { status: 400 }
          );
        }
      }
    }

    // Create new class
    const newClass = await ClassModel.create({
      className,
      grade,
      // Note: teachers and students are now stored in UserModel with assignedClasses
    });

    // Populate grade for response
    const populatedClass = await ClassModel.findById(newClass._id).populate(
      "grade",
      "gradeNumber name"
    );

    // If teachers were provided, assign them to the class
    if (teachers && Array.isArray(teachers) && teachers.length > 0) {
      await userModel.updateMany(
        { _id: { $in: teachers } },
        { $addToSet: { assignedClasses: newClass._id } }
      );

      // Get assigned teachers for response
      const assignedTeachers = await userModel
        .find({
          _id: { $in: teachers },
          role: "teacher",
        })
        .select("firstName lastName email");

      return NextResponse.json(
        {
          class: populatedClass,
          teachers: assignedTeachers,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ class: populatedClass }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create class" },
      { status: 500 }
    );
  }
}

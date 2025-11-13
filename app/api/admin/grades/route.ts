import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import GradeModel from "@/models/GradeModel";
import dbConnect from "@/lib/mongodb";

// GET all grades
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

    // No query parameters needed since academicYear and isActive fields are removed
    const query: any = {};

    const grades = await GradeModel.find(query).sort({ gradeNumber: 1 });

    return NextResponse.json({ grades }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

// POST create a new grade
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
    const { gradeNumber, name, description, schoolID } = body;

    // Validate required fields
    if (!gradeNumber || !name || !schoolID) {
      return NextResponse.json(
        { error: "Grade number, name, and school are required" },
        { status: 400 }
      );
    }

    // Check if grade already exists
    const existingGrade = await GradeModel.findOne({
      gradeNumber,
      schoolID,
    });

    if (existingGrade) {
      return NextResponse.json(
        {
          error: `Grade ${gradeNumber} already exists for this school`,
        },
        { status: 409 }
      );
    }

    // Create new grade
    const newGrade = await GradeModel.create({
      gradeNumber,
      name,
      description,
      schoolID,
    });

    return NextResponse.json({ grade: newGrade }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create grade" },
      { status: 500 }
    );
  }
}

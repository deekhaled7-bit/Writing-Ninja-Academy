import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import GradeModel from "@/models/GradeModel";
import ClassModel from "@/models/ClassModel";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// GET a single grade by ID
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
        { error: "Invalid grade ID format" },
        { status: 400 }
      );
    }

    const grade = await GradeModel.findById(id);

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ grade }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching grade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grade" },
      { status: 500 }
    );
  }
}

// PUT update a grade by ID
export async function PUT(
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
        { error: "Invalid grade ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { gradeNumber, name, description } = body;

    // Check if grade exists
    const existingGrade = await GradeModel.findById(id);

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if updating to a grade number that already exists
    if (gradeNumber && gradeNumber !== existingGrade.gradeNumber) {
      const duplicateGrade = await GradeModel.findOne({
        _id: { $ne: id },
        gradeNumber,
      });

      if (duplicateGrade) {
        return NextResponse.json(
          {
            error: `Grade ${gradeNumber} already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Update grade
    const updatedGrade = await GradeModel.findByIdAndUpdate(
      id,
      {
        ...(gradeNumber && { gradeNumber }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ grade: updatedGrade }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update grade" },
      { status: 500 }
    );
  }
}

// DELETE a grade by ID
export async function DELETE(
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
        { error: "Invalid grade ID format" },
        { status: 400 }
      );
    }

    // Check if grade exists
    const grade = await GradeModel.findById(id);

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if there are classes associated with this grade
    const associatedClasses = await ClassModel.countDocuments({ grade: id });

    if (associatedClasses > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete grade. There are ${associatedClasses} classes associated with this grade.`,
        },
        { status: 400 }
      );
    }

    // Delete grade
    await GradeModel.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Grade deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete grade" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import ClassModel from "@/models/ClassModel";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import { ConnectDB } from "@/config/db";

// GET all classes for public access (for student registration)
export async function GET(req: NextRequest) {
  try {
    await ConnectDB();

    // Get gradeId from query parameters
    const { searchParams } = new URL(req.url);
    const gradeId = searchParams.get("gradeId");

    // Build query based on whether gradeId is provided
    const query: any = {};
    if (gradeId) {
      // Validate gradeId format
      if (!mongoose.Types.ObjectId.isValid(gradeId)) {
        return NextResponse.json(
          { error: "Invalid grade ID format" },
          { status: 400 }
        );
      }
      query.grade = gradeId;
    }

    const classes = await ClassModel.find(query)
      .populate("grade", "gradeNumber name")
      .sort({ grade: 1 });

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

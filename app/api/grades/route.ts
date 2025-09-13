import { NextRequest, NextResponse } from "next/server";
import GradeModel from "@/models/GradeModel";
import dbConnect from "@/lib/mongodb";

// GET all grades for public access (for student registration)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const grades = await GradeModel.find().sort({ gradeNumber: 1 });
    
    return NextResponse.json({ grades }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch grades" },
      { status: 500 }
    );
  }
}
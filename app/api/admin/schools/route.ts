import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongodb";
import SchoolModel from "@/models/school";

// GET all schools
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const schools = await SchoolModel.find({}).sort({ name: 1 });
    return NextResponse.json({ schools }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

// POST create a new school
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await SchoolModel.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }

    const school = await SchoolModel.create({ name: name.trim() });
    return NextResponse.json({ school }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create school" },
      { status: 500 }
    );
  }
}
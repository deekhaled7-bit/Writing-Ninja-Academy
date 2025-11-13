import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongodb";
import SchoolModel from "@/models/school";
import mongoose from "mongoose";

// GET a single school by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid school ID format" },
        { status: 400 }
      );
    }

    const school = await SchoolModel.findById(id);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({ school }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch school" },
      { status: 500 }
    );
  }
}

// PUT update a school by ID
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid school ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    const existingSchool = await SchoolModel.findById(id);
    if (!existingSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Check for duplicate name in other records
    const duplicate = await SchoolModel.findOne({
      _id: { $ne: id },
      name: name.trim(),
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }

    const updatedSchool = await SchoolModel.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ school: updatedSchool }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update school" },
      { status: 500 }
    );
  }
}

// DELETE a school by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid school ID format" },
        { status: 400 }
      );
    }

    const school = await SchoolModel.findById(id);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    await SchoolModel.findByIdAndDelete(id);
    return NextResponse.json({ message: "School deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete school" },
      { status: 500 }
    );
  }
}
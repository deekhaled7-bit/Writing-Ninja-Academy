import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import UserModel from "@/models/userModel";
import dbConnect from "@/lib/mongodb";

// GET all students for admin
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

    // Get query parameters for filtering
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { role: "student" };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    // Count total students for pagination
    const total = await UserModel.countDocuments(query);

    // Fetch students with pagination
    const students = await UserModel.find(query)
      .select("_id firstName lastName email username age profilePicture")
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}
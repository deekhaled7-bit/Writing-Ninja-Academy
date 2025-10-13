import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/config/db";
import UserModel from "@/models/userModel";
import { hash } from "bcryptjs";
import GradeModel from "@/models/GradeModel";
import ClassModel from "@/models/ClassModel";

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await ConnectDB();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build query
    let query: any = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    console.log("registeringModels" + GradeModel + ClassModel);
    const users = await UserModel.find(query)
      .select("-password") // Exclude password field
      .populate({
        path: "grade",
        select: "name gradeNumber _id",
        model: GradeModel,
        options: { strictPopulate: false },
      })
      .populate({
        path: "assignedClasses",
        select: "className _id",
        model: ClassModel,
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    // Map the populated grade to gradeId for frontend consistency
    const mappedUsers = users.map((user) => {
      const userObj = user.toObject();
      if (userObj.grade) {
        userObj.gradeId = userObj.grade._id;
      }
      return userObj;
    });

    return NextResponse.json({ users: mappedUsers }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const body = await request.json();

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password before creating the user
    if (body.password) {
      body.password = await hash(body.password, 10);
    }

    // Extract grade and class data for students
    const { gradeId, assignedClasses, ...userData } = body;

    // Create new user
    const newUser = await UserModel.create({
      ...userData,
      // Add grade and assignedClasses only for students
      ...(userData.role === "student" && {
        grade: gradeId,
        assignedClasses: assignedClasses || [],
      }),
    });

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: "User created successfully", user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

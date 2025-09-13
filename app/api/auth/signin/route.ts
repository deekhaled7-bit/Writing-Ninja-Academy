import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/models/userModel";
import bcrypt from "bcrypt";
import { ConnectDB } from "@/config/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await ConnectDB();

    // Find the user by email
    const user = await UserModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create user object without sensitive information
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "student",
      createdAt: user.createdAt,
    };

    // Return successful response
    const response = NextResponse.json(
      {
        success: true,
        message: "Sign in successful",
        user: userResponse,
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "@/config/db";
import UserModel from "@/models/userModel";
import ClassModel from "@/models/ClassModel";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { sendMail } from "@/lib/email";
import verificationsModel from "@/models/sessionModel";
import { SubscriprtionMail } from "@/utils/subscriptionMail";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword, role, classId } =
      await request.json();
    console.log(name, email, password, confirmPassword, role, classId);
    // Split name into firstName and lastName
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'student' or 'teacher'" },
        { status: 400 }
      );
    }

    // Validate classId if role is student
    if (role === "student" && !classId) {
      return NextResponse.json(
        { error: "Class ID is required for student registration" },
        { status: 400 }
      );
    }

    // Validate classId format if provided
    if (classId && !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: "Invalid class ID format" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Connect to database
    await ConnectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const userData = {
      firstName,
      lastName,
      username: name,
      email,
      password: hashedPassword,
      role, // Use the provided role or default to "student"
      emailVerified: false, // Skip email verification for now
      assignedClasses: role === "student" && classId ? [classId] : [],
    };

    const newUser = await UserModel.create(userData);
    await verificationsModel.create({ userID: newUser.id });
    console.log("here" + newUser.id);
    //    const token = await bcrypt.hash(savedUser._id.toString(), saltRounds);

    // If student, update class to include this student
    // if (role === "student" && classId) {
    //   await ClassModel.findByIdAndUpdate(classId, {
    //     $addToSet: { students: newUser._id },
    //   });
    // }

    // Create response with user data (excluding password)
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    const verificationLink = `${process.env.baseUrl}api/auth/verification/${newUser.id}`;
    await sendMail({
      to: email,
      name: "wiiga",
      subject: "Please click on link to verify your account",
      body: `${verificationEmailTemplate(verificationLink)}`,
      from: "auth@thewritingninjasacademy.org",
      // body: `<a href=${verificationLink}> click here to verify your account</a>`,
      //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
    });

    // Return JSON with success message and redirect URL for the frontend to handle
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Please check your email for verification.",
        user: userResponse,
        redirectUrl: '/verify-email'
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

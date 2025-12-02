import { ConnectDB } from "@/config/db";
import verificationsModel from "@/models/sessionModel";
import UserModel from "@/models/userModel";
import ClassModel from "@/models/ClassModel";
import { sendMail } from "@/lib/email";
import { SubscriprtionMail } from "@/utils/subscriptionMail";
import { verificationEmailTemplate } from "@/utils/verificationEmailTempelate";
import { hash } from "bcryptjs";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const { username, email, password, role, classId } = await req.json();
    console.log("here" + username, email, password, role);

    // Validate required fields
    if (!username || !email || !password || !role) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    // Validate role
    if (!["student", "teacher"].includes(role)) {
      return new Response(
        JSON.stringify({
          error: "Invalid role. Must be 'student' or 'teacher'",
        }),
        { status: 400 }
      );
    }

    // Validate classId if role is student
    if (role === "student" && !classId) {
      return new Response(
        JSON.stringify({
          error: "Class ID is required for student registration",
        }),
        { status: 400 }
      );
    }

    // Validate classId format if provided
    if (classId && !mongoose.Types.ObjectId.isValid(classId)) {
      return new Response(
        JSON.stringify({ error: "Invalid class ID format" }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
      });
    }

    // Validate password length
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400 }
      );
    }

    await ConnectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Email already used" }), {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 10);
    console.log(username, email, hashedPassword);

    // Create user with role
    const userData = {
      username: username,
      email: email,
      password: hashedPassword,
      role: role,
      active: true, // Set active to true for testing
      verified: true, // Set verified to true for testing
      assignedClasses: role === "student" && classId ? [classId] : [],
    };

    const user = await UserModel.create(userData);

    // If student, update class to include this student
    if (role === "student" && classId) {
      await ClassModel.findByIdAndUpdate(classId, {
        $addToSet: { students: user._id },
      });
    }

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      assignedClasses: user.assignedClasses,
      createdAt: user.createdAt,
    };
    await verificationsModel.create({ userID: userResponse.id });
    console.log("here" + userResponse.id);
    //    const token = await bcrypt.hash(savedUser._id.toString(), saltRounds);
    const verificationLink = `${process.env.baseUrl}api/auth/verification/${userResponse.id}`;
    await sendMail({
      to: email,
      name: "wiiga",
      subject: "Please click on link to verify your account",
      body: `${SubscriprtionMail(verificationLink)}`,
      from: "authentication@thewritingninjasacademy.org",
      // body: `<a href=${verificationLink}> click here to verify your account</a>`,
      //   body: compileWelcomeTemplate("Vahid", "youtube.com/@sakuradev"),
    });

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: userResponse,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

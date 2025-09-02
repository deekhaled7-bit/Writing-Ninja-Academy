import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Mock user creation - In a real app, you would:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Save user to database
    // 4. Send verification email
    // 5. Generate JWT token or session

    // For demo purposes, create a mock user
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
      isVerified: false // In real app, user would need to verify email
    };

    // In a real app, you would set secure HTTP-only cookies here
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Welcome to Ninja Bolt!",
        user: newUser
      },
      { status: 201 }
    );

    // Mock session cookie (in production, use secure, HTTP-only cookies)
    response.cookies.set("session", "mock_session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
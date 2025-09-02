import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock authentication - In a real app, you would:
    // 1. Hash the password and compare with stored hash
    // 2. Query your database for the user
    // 3. Generate a JWT token or session
    // 4. Set secure cookies

    // For demo purposes, accept any email/password combination
    const mockUser = {
      id: "user_123",
      email,
      name: "Demo User",
      createdAt: new Date().toISOString()
    };

    // In a real app, you would set secure HTTP-only cookies here
    const response = NextResponse.json(
      {
        success: true,
        message: "Sign in successful",
        user: mockUser
      },
      { status: 200 }
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
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
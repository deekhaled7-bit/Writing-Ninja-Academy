import { NextResponse } from "next/server";
import PasswordResetToken from "@/models/PasswordResetToken";
import UserModel from "@/models/userModel";
import bcrypt from "bcryptjs";
import { ConnectDB } from "@/config/db";

export async function GET(req: Request) {
  await ConnectDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token)
    return NextResponse.json(
      { success: false, message: "Token required" },
      { status: 400 }
    );
  const record = await PasswordResetToken.findOne({ token });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { success: false, message: "Token invalid or expired" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  await ConnectDB();
  const { token, password } = await req.json();
  const record = await PasswordResetToken.findOne({ token });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { success: false, message: "Token invalid or expired" },
      { status: 400 }
    );
  }
  const userModel = await UserModel.findById(record.userId);
  if (!userModel)
    return NextResponse.json(
      { success: false, message: "UserModel not found" },
      { status: 404 }
    );
  userModel.password = await bcrypt.hash(password, 10);
  await userModel.save();
  await PasswordResetToken.deleteOne({ token });
  return NextResponse.json({
    success: true,
    message: "Password reset successful",
  });
}

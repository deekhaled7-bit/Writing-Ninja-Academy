import { NextResponse } from "next/server";
import UserModel from "@/models/userModel";
import PasswordResetToken from "@/models/PasswordResetToken";
import crypto from "crypto";
import { sendMail } from "@/lib/email";
import { ConnectDB } from "@/config/db";
import { resetPasswordEmailTemplate } from "@/utils/resetPasswordEmail";

export async function POST(req: Request) {
  await ConnectDB();
  const { email } = await req.json();
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }
  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await PasswordResetToken.create({ userId: user._id, token, expiresAt });
  // Send email
  const resetUrl = `${
    process.env.baseUrl || "http://localhost:3000"
  }/signin/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: "Password Reset",
    name: user.name || user.username,
    body: `${resetPasswordEmailTemplate(resetUrl)}`,
    from: "auth@thewritingninjasacademy.org",
  });
  return NextResponse.json({ success: true, message: "Reset email sent" });
}

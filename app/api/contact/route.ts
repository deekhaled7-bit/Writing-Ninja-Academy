import { NextResponse } from "next/server";
import { sendContactMail } from "@/lib/contactMail";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendContactMail({
      to: "Saraa.ahmed@manhattanschools-eg.com",
      name: `${firstName} ${lastName}`,
      subject: `Contact Form: ${subject}`,
      body: message,
      from: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

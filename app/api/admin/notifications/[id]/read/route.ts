import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await ConnectDB();

    const updated = await InteractionsModel.findByIdAndUpdate(
      id,
      { readByAdmin: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error marking admin notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

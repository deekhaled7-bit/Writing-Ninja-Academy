import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ConnectDB();

    const targetTypes = ["story", "comment", "reply"];

    await InteractionsModel.updateMany(
      { targetType: { $in: targetTypes }, readByAdmin: false },
      { readByAdmin: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking admin notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

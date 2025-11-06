import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ConnectDB();

    // Keep consistent with admin notifications target types
    const targetTypes = ["story", "comment", "reply"];

    const count = await InteractionsModel.countDocuments({
      targetType: { $in: targetTypes },
      readByAdmin: false,
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching admin unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}

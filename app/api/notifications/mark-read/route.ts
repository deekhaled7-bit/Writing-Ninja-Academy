import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Mark all notifications for this user as read
    await InteractionsModel.updateMany(
      { notifyUserId: userId, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
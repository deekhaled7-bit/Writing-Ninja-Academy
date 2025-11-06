import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import InteractionsModel from "@/models/interactionsModel";
import { ConnectDB } from "@/config/db";

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

    // Only fetch interactions of specified target types
    const targetTypes = ["story", "comment", "reply"];

    const notifications = await InteractionsModel.find({
      targetType: { $in: targetTypes },
    })
      .populate({
        path: "userId",
        model: "User",
        select: "firstName lastName profilePicture",
      })
      // Populate story using parentId (when applicable)
      .populate({
        path: "parentId",
        model: "Story",
        select: "title _id",
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
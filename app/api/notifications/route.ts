import { NextRequest, NextResponse } from "next/server";
import InteractionsModel from "@/models/interactionsModel";
import { connectToDatabase } from "@/utils/mongodb";
import UserModel from "@/models/userModel";
import Story from "@/models/Story";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log("registeringUsers" + UserModel + Story);
    // Find interactions where notifyUserId matches the provided userId
    const notifications = await InteractionsModel.find({
      notifyUserId: userId,
    })
      .populate({
        path: "userId",
        model: "User",
        select: "firstName lastName profilePicture",
      })
      // Populate story using parentId when applicable (e.g., story/comment/reply interactions)
      .populate({
        path: "parentId",
        model: "Story",
        select: "title _id",
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to 50 notifications

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

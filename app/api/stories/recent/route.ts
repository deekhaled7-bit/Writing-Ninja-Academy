import { NextResponse } from "next/server";
import Story from "@/models/Story";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();

    const recentStories = await Story.find({
      isPublished: true,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return NextResponse.json(recentStories);
  } catch (error) {
    console.error("Error fetching recent stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent stories" },
      { status: 500 }
    );
  }
}
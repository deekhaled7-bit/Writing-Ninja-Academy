import { NextResponse } from "next/server";
import Story from "@/models/Story";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();

    const featuredStories = await Story.find({
      featured: true,
      isPublished: true,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json(featuredStories);
  } catch (error) {
    console.error("Error fetching featured stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured stories" },
      { status: 500 }
    );
  }
}

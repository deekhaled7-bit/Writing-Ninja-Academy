import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Story from "../../../models/Story";
import User from "../../../models/User";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const ageGroup = searchParams.get("ageGroup");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const filter: any = { isPublished: true };

  if (ageGroup && ageGroup !== "all") {
    filter.ageGroup = ageGroup;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { authorName: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const stories = await Story.find(filter)
      .sort({ readCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .lean();

    const total = await Story.countDocuments(filter);

    return NextResponse.json({
      stories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // For demo purposes, we'll use a default user ID
  const defaultUserId = "65f4b0b0f0b0b0b0b0b0b0b0";

  await dbConnect();

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const ageGroup = formData.get("ageGroup") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!title || !description || !ageGroup || !category || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const fileType = file.type.startsWith("video/") ? "video" : "raw";
    const uploadResult = (await uploadToCloudinary(file, fileType)) as any;

    // Get user info (or create a default user for demo)
    let user = await User.findById(defaultUserId);
    if (!user) {
      // Create a default user for demo purposes
      user = await User.create({
        _id: defaultUserId,
        name: "Demo User",
        email: "demo@example.com",
        ninjaLevel: 1,
        ninjaGold: 100,
        storiesUploaded: 0
      });
    }

    // Create story
    const story = await Story.create({
      title,
      description,
      author: defaultUserId,
      authorName: user.name,
      ageGroup,
      category,
      fileType: file.type.startsWith("video/") ? "video" : "pdf",
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
    });

    // Update user stats
    await User.findByIdAndUpdate(defaultUserId, {
      $inc: { storiesUploaded: 1, ninjaGold: 10 },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload story" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { uploadToCloudinary } from "@/lib/cloudinary";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import ClassModel from "@/models/ClassModel";
import { ConnectDB } from "@/config/db";

// Mock stories data
const mockStories = [
  {
    _id: "1",
    title: "The Dragon's Secret Garden",
    description:
      "A young girl discovers a hidden garden where a friendly dragon grows magical flowers that can heal any wound.",
    authorName: "Emma Chen",
    ageGroup: "5-8",
    category: "fantasy",
    readCount: 1247,
    likeCount: 89,
    commentCount: 12,
    completedCount: 156,
    createdAt: "2024-01-15T10:30:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/dragon-garden.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author1", name: "Emma Chen" },
  },
  {
    _id: "2",
    title: "Space Pirates of Nebula Seven",
    description:
      "Captain Alex and their crew must outsmart alien pirates to save their home planet from destruction.",
    authorName: "Marcus Rodriguez",
    ageGroup: "9-12",
    category: "science-fiction",
    readCount: 2156,
    likeCount: 134,
    commentCount: 23,
    completedCount: 289,
    createdAt: "2024-01-12T14:20:00Z",
    fileType: "video",
    coverImageUrl: "/stories/space-pirates.svg",
    fileUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    isPublished: true,
    author: { _id: "author2", name: "Marcus Rodriguez" },
  },
  {
    _id: "3",
    title: "The Mystery of the Missing Homework",
    description:
      "When homework starts disappearing from lockers, detective duo Sam and Riley must solve the case before the big test.",
    authorName: "Zoe Williams",
    ageGroup: "9-12",
    category: "mystery",
    readCount: 987,
    likeCount: 67,
    commentCount: 8,
    completedCount: 123,
    createdAt: "2024-01-10T09:15:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/mystery-homework.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author3", name: "Zoe Williams" },
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ageGroup = searchParams.get("ageGroup");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  try {
    await dbConnect();

    // Build query filters
    const query: any = { isPublished: true };

    if (ageGroup && ageGroup !== "all") {
      query.ageGroup = ageGroup;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { authorName: searchRegex },
      ];
    }

    // Get total count for pagination
    const totalStories = await Story.countDocuments(query);
    const totalPages = Math.ceil(totalStories / limit);

    // Fetch stories with pagination
    const stories = await Story.find(query)
      .populate("author", "firstName lastName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      stories,
      pagination: {
        currentPage: page,
        totalPages,
        totalStories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    // Get session to check user role
    const session = await getServerSession(authOptions);

    // Only allow teachers and admins to upload stories
    if (
      !session ||
      (session.user.role !== "teacher" && session.user.role !== "admin")
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Only teachers and admins can upload stories." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const ageGroup = formData.get("ageGroup") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;
    const coverImage = formData.get("coverImage") as File | null;
    const authorId = formData.get("authorId") as string;

    if (
      !title ||
      !description ||
      !ageGroup ||
      !category ||
      !file ||
      !authorId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that the author exists and is a student
    const authorUser = await UserModel.findById(authorId);
    if (!authorUser) {
      return NextResponse.json(
        { error: "Selected author does not exist" },
        { status: 400 }
      );
    }

    if (authorUser.role !== "student") {
      return NextResponse.json(
        { error: "Selected author must be a student" },
        { status: 400 }
      );
    }

    // For teachers, verify they have access to this student through their classes
    if (session.user.role === "teacher") {
      const teacherClasses = await ClassModel.find({
        teachers: session.user.id,
      });
      // const teacherClassIds = teacherClasses.map((c) => c._id.toString());

      // const studentClasses = await ClassModel.find({
      //   _id: { $in: teacherClassIds },
      //   students: authorId,
      // });

      // if (studentClasses.length === 0) {
      //   return NextResponse.json(
      //     {
      //       error: "You do not have access to upload stories for this student",
      //     },
      //     { status: 403 }
      //   );
      // }
    }

    // Validate file type and size
    const allowedTypes = [
      "application/pdf",
      "video/mp4",
      "video/mov",
      "video/avi",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF and video files (MP4, MOV, AVI) are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Get the selected author
    const author = await UserModel.findById(authorId);

    // Upload file to Cloudinary
    let uploadResult;
    try {
      const resourceType = file.type === "application/pdf" ? "auto" : "video";
      uploadResult = await uploadToCloudinary(file, resourceType);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to cloud storage" },
        { status: 500 }
      );
    }

    // Upload cover image to Cloudinary if provided
    let coverImageUrl = null;
    if (coverImage) {
      // Validate cover image
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(coverImage.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid cover image type. Only JPEG, PNG, and WebP are allowed.",
          },
          { status: 400 }
        );
      }

      const maxImageSize = 10 * 1024 * 1024; // 10MB
      if (coverImage.size > maxImageSize) {
        return NextResponse.json(
          { error: "Cover image size too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      try {
        const coverImageResult = await uploadToCloudinary(coverImage, "auto");
        coverImageUrl = (coverImageResult as any).secure_url;
      } catch (uploadError) {
        console.error("Cover image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload cover image to cloud storage" },
          { status: 500 }
        );
      }
    }

    // Create and save story to database
    const newStory = new Story({
      title,
      description,
      author: author._id,
      authorName: `${author.firstName} ${author.lastName}`,
      ageGroup,
      category,
      fileType: file.type.startsWith("video/") ? "video" : "pdf",
      fileUrl: (uploadResult as any).secure_url,
      cloudinaryId: (uploadResult as any).public_id,
      coverImageUrl: coverImageUrl,
      isPublished: false, // Default to not published
      status: "waiting_revision", // Default status for new stories
    });

    const savedStory = await newStory.save();

    // Update user's stories uploaded count
    await UserModel.findByIdAndUpdate(author._id, {
      $inc: { storiesUploaded: 1 },
    });

    return NextResponse.json(
      {
        story: savedStory,
        message: "Story uploaded successfully and published!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload story" },
      { status: 500 }
    );
  }
}

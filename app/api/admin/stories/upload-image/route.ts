import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import { directCloudinaryUpload } from "@/utils/directCloudinaryUpload";

export async function POST(request: NextRequest) {
  try {
    // Get session to check user role
    const session = await getServerSession(authOptions);

    // Only allow admins to access this endpoint
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("file") as File;
    const storyId = formData.get("storyId") as string;

    if (!imageFile || !storyId) {
      return NextResponse.json(
        { error: "Image file and story ID are required" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, or WebP images are allowed" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the story
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Upload image to Cloudinary
    try {
      const uploadResult = await directCloudinaryUpload(imageFile, {
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
        folder: "story-covers",
        resourceType: "image",
      });

      if (!uploadResult || !uploadResult.secure_url) {
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      // Update story with new cover image URL
      story.coverImageUrl = uploadResult.secure_url;
      await story.save();

      return NextResponse.json({
        message: "Cover image uploaded successfully",
        coverImageUrl: uploadResult.secure_url
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image to cloud storage" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
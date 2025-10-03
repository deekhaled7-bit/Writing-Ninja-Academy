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
    const pdfFile = formData.get("pdf") as File;
    const storyId = formData.get("storyId") as string;

    if (!pdfFile || !storyId) {
      return NextResponse.json(
        { error: "PDF file and story ID are required" },
        { status: 400 }
      );
    }

    // Check file type
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
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

    // Upload PDF to Cloudinary using directCloudinaryUpload
    try {
      const uploadResult = await directCloudinaryUpload(pdfFile, {
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
        folder: "stories/pdfs",
        resourceType: "raw",
      });

      if (!uploadResult || !uploadResult.secure_url) {
        return NextResponse.json(
          { error: "Failed to upload PDF" },
          { status: 500 }
        );
      }

      // Update story with new PDF URL
      story.pdfUrl = uploadResult.secure_url;
      story.publicId = uploadResult.public_id;
      await story.save();

      return NextResponse.json({
        message: "PDF uploaded successfully",
        pdfUrl: uploadResult.secure_url
      });
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload PDF to cloud storage" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

// Mock stories data to verify story exists
const mockStories = ["1", "2", "3"]; // Valid story IDs

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: "Comment is too long" },
        { status: 400 }
      );
    }

    // Verify story exists in our mock data
    if (!mockStories.includes(resolvedParams.id)) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Create mock comment
    const mockComment = {
      _id: `comment_${Date.now()}`,
      author: "demo_user_id",
      authorName: "Demo User",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would save to database and update counts
    console.log(`Mock comment created for story ${resolvedParams.id}:`, mockComment);

    return NextResponse.json(mockComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
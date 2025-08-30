import { NextRequest, NextResponse } from "next/server";

// Mock stories data
const mockStories = [
  {
    _id: "1",
    title: "The Dragon's Secret Garden",
    description: "A young girl discovers a hidden garden where a friendly dragon grows magical flowers that can heal any wound.",
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
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author1", name: "Emma Chen" }
  },
  {
    _id: "2",
    title: "Space Pirates of Nebula Seven",
    description: "Captain Alex and their crew must outsmart alien pirates to save their home planet from destruction.",
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
    fileUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    isPublished: true,
    author: { _id: "author2", name: "Marcus Rodriguez" }
  },
  {
    _id: "3",
    title: "The Mystery of the Missing Homework",
    description: "When homework starts disappearing from lockers, detective duo Sam and Riley must solve the case before the big test.",
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
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author3", name: "Zoe Williams" }
  }
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
    let filteredStories = mockStories.filter(story => story.isPublished);

    if (ageGroup && ageGroup !== "all") {
      filteredStories = filteredStories.filter(story => story.ageGroup === ageGroup);
    }

    if (category && category !== "all") {
      filteredStories = filteredStories.filter(story => story.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredStories = filteredStories.filter(story => 
        story.title.toLowerCase().includes(searchLower) ||
        story.description.toLowerCase().includes(searchLower) ||
        story.authorName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by readCount and createdAt
    filteredStories.sort((a, b) => {
      if (b.readCount !== a.readCount) {
        return b.readCount - a.readCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const paginatedStories = filteredStories.slice(skip, skip + limit);
    const total = filteredStories.length;

    return NextResponse.json({
      stories: paginatedStories,
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

    // Mock story creation (no actual file upload for demo)
    const mockStory = {
      _id: `story_${Date.now()}`,
      title,
      description,
      author: "demo_user_id",
      authorName: "Demo User",
      ageGroup,
      category,
      fileType: file.type.startsWith("video/") ? "video" : "pdf",
      fileUrl: file.type.startsWith("video/") 
        ? "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
        : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      readCount: 0,
      likeCount: 0,
      commentCount: 0,
      completedCount: 0,
      isPublished: false, // Stories need admin approval
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ story: mockStory }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload story" },
      { status: 500 }
    );
  }
}

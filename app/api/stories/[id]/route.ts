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
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author1", name: "Emma Chen", profilePicture: "", ninjaLevel: 3 }
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
    fileUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    isPublished: true,
    author: { _id: "author2", name: "Marcus Rodriguez", profilePicture: "", ninjaLevel: 5 }
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
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    author: { _id: "author3", name: "Zoe Williams", profilePicture: "", ninjaLevel: 2 }
  }
];

// Mock comments data
const mockComments = [
  {
    _id: "comment1",
    story: "1",
    author: "user1",
    authorName: "Alex Johnson",
    content: "This story is amazing! I love the magical garden.",
    createdAt: "2024-01-16T10:30:00Z",
    isApproved: true
  },
  {
    _id: "comment2",
    story: "1",
    author: "user2",
    authorName: "Sarah Kim",
    content: "The dragon character is so friendly and kind!",
    createdAt: "2024-01-16T11:15:00Z",
    isApproved: true
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {
    const story = mockStories.find(s => s._id === resolvedParams.id);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get comments for this story
    const comments = mockComments
      .filter(comment => comment.story === resolvedParams.id && comment.isApproved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return NextResponse.json({ story, comments });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;

  try {
    const { action } = await request.json();

    // Mock interaction tracking - just return success
    // In a real app, this would update the database
    console.log(`Mock interaction: ${action} for story ${resolvedParams.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

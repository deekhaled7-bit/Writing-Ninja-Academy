import dbConnect from "@/lib/mongodb";
import Story from "@/models/Story";
import UserModel from "@/models/userModel";
import StoryCard from "@/components/stories/story-card";

interface AuthorStoriesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthorStoriesPage({ params, searchParams }: AuthorStoriesPageProps) {
  const { id } = await params;
  await searchParams;

  await dbConnect();

  const [authorDoc, rawStories] = await Promise.all([
    UserModel.findById(id).select("firstName lastName storiesUploaded ninjaLevel").lean(),
    Story.find({ author: id, isPublished: true })
    .sort({ createdAt: -1 })
      .lean(),
  ]);

  const authorName = authorDoc
    ? `${(authorDoc as any).firstName} ${(authorDoc as any).lastName}`
    : "Author";

  const stories = rawStories.map((story: any) => ({
    _id: story._id.toString(),
    title: story.title,
    description: story.description,
    authorName: story.authorName,
    ageGroup: story.ageGroup,
    category: story.category,
    fileType: story.fileType,
    fileUrl: story.fileUrl,
    coverImageUrl: story.coverImageUrl || "",
    readCount: story.readCount || 0,
    likeCount: story.likeCount || 0,
    createdAt: (story.createdAt instanceof Date
      ? story.createdAt
      : new Date(story.createdAt)
    ).toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-oswald text-2xl md:text-3xl mb-6">
          {authorName} — Stories
          <span className="ml-3 inline-flex items-center">
            <span className="border px-2 py-1 text-sm rounded">
              {(() => {
                const count = Number((authorDoc as any)?.storiesUploaded || 0);
                if (count >= 15) return "Black Belt";
                if (count >= 10) return "Brown Belt";
                if (count >= 7) return "Blue Belt";
                if (count >= 5) return "Green Belt";
                if (count >= 4) return "Orange Belt";
                if (count >= 2) return "Yellow Belt";
                if (count >= 1) return "White Belt";
                return "";
              })()}
            </span>
          </span>
        </h1>
        {stories.length === 0 ? (
          <div className="text-gray-600">No stories found for this author.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



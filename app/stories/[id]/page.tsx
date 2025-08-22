import { notFound } from 'next/navigation';
import StoryDetails from '@/components/stories/story-details';

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

async function getStory(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const resolvedParams = await params;
  const data = await getStory(resolvedParams.id);
  
  if (!data || !data.story) {
    notFound();
  }

  return <StoryDetails story={data.story} comments={data.comments} />;
}
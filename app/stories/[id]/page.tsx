import { notFound } from 'next/navigation';
import StoryDetails from '@/components/stories/story-details';
import { ServerPageProps } from '@/types/page-props';

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

async function getComments(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}/comments`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    return [];
  }
}

export default async function StoryPage({ params }: ServerPageProps) {
  const resolvedParams = await params;
  const [storyData, comments] = await Promise.all([
    getStory(resolvedParams.id),
    getComments(resolvedParams.id)
  ]);
  
  if (!storyData || !storyData.story) {
    notFound();
  }

  return <StoryDetails story={storyData.story} comments={comments} />;
}
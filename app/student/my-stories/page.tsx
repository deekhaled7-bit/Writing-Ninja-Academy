'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import StoryCard from '@/components/stories/story-card';
import { Story as StoryInterface } from '@/app/interfaces/interface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Story = {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'review';
  createdAt: string;
  updatedAt: string;
  description?: string;
  authorName?: string;
  ageGroup?: string;
  category?: string;
  readCount?: number;
  likeCount?: number;
  coverImageUrl?: string;
  fileType?: string;
  fileUrl?: string;
};

export default function MyStoriesPage() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Don't fetch if no session yet
    if (!session) return;
    
    setLoading(true);
    
    // Fetch stories from the API
    const fetchStories = async () => {
      try {
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        
        const response = await fetch(`/api/stories?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        
        const data = await response.json();
        
        if (!data.stories || data.stories.length === 0) {
          setStories([]);
          return;
        }
        
        // Transform the API response to match our Story type
        const transformedStories: Story[] = data.stories
          .filter((story: any) => story.author && story.author._id === session?.user?.id) // Only show stories by the current user
          .map((story: any) => ({
            id: story._id,
            _id: story._id, // Add _id for StoryCard compatibility
            title: story.title,
            description: story.description || 'No description available',
            authorName: session?.user?.name || 'You',
            ageGroup: story.ageGroup || '5-8',
            category: story.category || 'other',
            readCount: story.readCount || 0,
            likeCount: story.likeCount || 0,
            status: story.isPublished ? 'published' : (story.status === 'waiting_revision' ? 'review' : 'draft'),
            createdAt: new Date(story.createdAt).toISOString(),
            updatedAt: new Date(story.updatedAt || story.createdAt).toISOString().split('T')[0],
            coverImageUrl: story.coverImageUrl || 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Image',
            fileType: story.fileType || 'pdf',
            fileUrl: story.fileUrl || '',
          }));
        
        setStories(transformedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch your stories. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [session, searchTerm, statusFilter]);

  const handleDeleteStory = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      toast({
        title: 'Story deleted',
        description: 'Your story has been deleted successfully.',
      });

      // Update the UI by removing the deleted story
      setStories(stories.filter((story) => story.id !== storyId));
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete your story. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewStory = (storyId: string) => {
    // Navigate to the story detail page
    window.location.href = `/stories/${storyId}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the fetching when searchTerm changes
  };

  // Stories are already filtered by the API
  const filteredStories = stories;

  const getStatusBadge = (status: Story['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500">Draft</Badge>;
      case 'review':
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  // Function to convert our Story type to StoryInterface for StoryCard component
  const convertToStoryInterface = (story: Story): StoryInterface => {
    return {
      _id: story.id,
      title: story.title,
      description: story.description || 'No description available',
      authorName: story.authorName || 'You',
      ageGroup: story.ageGroup || '5-8',
      category: story.category || 'other',
      readCount: story.readCount || 0,
      likeCount: story.likeCount || 0,
      createdAt: story.createdAt,
      coverImageUrl: story.coverImageUrl || 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Image',
      fileType: story.fileType || 'pdf',
      fileUrl: story.fileUrl || '',
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Stories</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-3 py-2 rounded-md border border-input bg-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="review">Under Review</option>
        </select>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div key={story.id} className="relative group">
                <StoryCard story={convertToStoryInterface(story)} />
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(story.status)}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute bottom-2 right-2 z-10 flex gap-1 bg-white bg-opacity-80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewStory(story.id);
                    }}
                    title="View story"
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {story.status !== 'published' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit story"
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteStory(story.id);
                    }}
                    title="Delete story"
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No stories found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">{story.title}</TableCell>
                    <TableCell>{getStatusBadge(story.status)}</TableCell>
                    <TableCell>{story.createdAt.split('T')[0]}</TableCell>
                    <TableCell>{story.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewStory(story.id)}
                        title="View story"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {story.status !== 'published' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit story"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStory(story.id)}
                        title="Delete story"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No stories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
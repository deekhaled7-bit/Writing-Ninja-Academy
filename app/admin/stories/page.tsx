'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Trash2, Upload, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

type Story = {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  status: 'published' | 'draft' | 'review' | 'waiting_revision' | 'rejected';
  createdAt: string;
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Use admin-specific API endpoint
        const response = await fetch('/api/admin/stories');
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        const data = await response.json();
        
        // Transform the data to match our Story type
        const formattedStories = data.stories.map((story: any) => ({
          id: story._id,
          title: story.title,
          author: story.author?.firstName && story.author?.lastName ? 
            `${story.author.firstName} ${story.author.lastName}` : 'Unknown',
          authorEmail: story.author?.email || 'N/A',
          status: story.isPublished ? 'published' : (story.status || 'draft'),
          createdAt: new Date(story.createdAt).toLocaleDateString(),
        }));
        
        setStories(formattedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: "Error",
          description: "Failed to fetch stories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, []);

  const handleDeleteStory = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete story');
      }
      
      // Update local state
      setStories(stories.filter(story => story.id !== storyId));
      
      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Error",
        description: "Failed to delete the story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeStoryStatus = async (storyId: string, newStatus: Story['status']) => {
    try {
      const response = await fetch(`/api/admin/stories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId, status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to change story status to ${newStatus}`);
      }
      
      // Update local state
      setStories(stories.map(story => 
        story.id === storyId ? { ...story, status: newStatus } : story
      ));
      
      toast({
        title: `Story ${newStatus === 'published' ? 'published' : 'updated'}`,
        description: `The story has been ${newStatus === 'published' ? 'published' : `marked as ${newStatus}`} successfully.`,
      });
    } catch (error) {
      console.error(`Error changing story status to ${newStatus}:`, error);
      toast({
        title: "Error",
        description: `Failed to change the story status. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const handlePublishStory = (storyId: string) => handleChangeStoryStatus(storyId, 'published');
  
  const handleReviewStory = (storyId: string) => handleChangeStoryStatus(storyId, 'review');

  const handleViewStory = (storyId: string) => {
    // Navigate to the story detail page
    window.open(`/stories/${storyId}`, '_blank');
  };

  // Filter stories based on search term
  const filteredStories = stories.filter(story => {
    return (
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.authorEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: Story['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500">Draft</Badge>;
      case 'review':
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case 'waiting_revision':
        return <Badge className="bg-orange-500">Waiting Revision</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Story Management</h1>
        <Link href="/upload">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Story
          </Button>
        </Link>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.author}</TableCell>
                  <TableCell>{getStatusBadge(story.status)}</TableCell>
                  <TableCell>{story.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewStory(story.id)}
                      title="View Story in New Tab"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                    
                    {/* Review button for draft stories */}
                    {story.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReviewStory(story.id)}
                        title="Mark as Under Review"
                      >
                        <Search className="h-4 w-4 text-yellow-500" />
                      </Button>
                    )}
                    
                    {/* Publish button for stories under review or waiting revision */}
                    {(story.status === 'review' || story.status === 'waiting_revision') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePublishStory(story.id)}
                        title="Publish Story"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStory(story.id)}
                      title="Delete Story"
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
    </div>
  );
}
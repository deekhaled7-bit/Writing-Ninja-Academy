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
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Story = {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'review';
  createdAt: string;
  updatedAt: string;
};

export default function MyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // In a real application, you would fetch stories from your API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockStories: Story[] = [
        {
          id: '1',
          title: 'The Adventure Begins',
          status: 'published',
          createdAt: '2023-04-15',
          updatedAt: '2023-04-20',
        },
        {
          id: '2',
          title: 'Mystery of the Lost Key',
          status: 'draft',
          createdAt: '2023-05-01',
          updatedAt: '2023-05-01',
        },
        {
          id: '3',
          title: 'The Magic Forest',
          status: 'review',
          createdAt: '2023-05-10',
          updatedAt: '2023-05-12',
        },
        {
          id: '4',
          title: 'Space Explorers',
          status: 'published',
          createdAt: '2023-03-05',
          updatedAt: '2023-03-15',
        },
        {
          id: '5',
          title: 'The Mysterious Island',
          status: 'draft',
          createdAt: '2023-05-18',
          updatedAt: '2023-05-18',
        },
      ];
      setStories(mockStories);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDeleteStory = async (storyId: string) => {
    // In a real application, you would delete the story via API
    // For now, we'll update the local state
    setStories(stories.filter(story => story.id !== storyId));
  };

  const handleViewStory = (storyId: string) => {
    // In a real application, you would navigate to the story detail page
    console.log(`Viewing story ${storyId}`);
  };

  // Filter stories based on search term and status filter
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Stories</h1>
        <Link href="/student/write">
          <Button className="bg-ninja-crimson hover:bg-ninja-crimson/90">
            Write New Story
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
                  <TableCell>{story.createdAt}</TableCell>
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
    </div>
  );
}
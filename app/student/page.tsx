'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type DashboardStats = {
  totalStories: number;
  publishedStories: number;
  drafts: number;
};

type RecentActivity = {
  id: string;
  type: 'feedback' | 'publish' | 'draft';
  title: string;
  date: string;
  message?: string;
};

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStories: 0,
    publishedStories: 0,
    drafts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        totalStories: 5,
        publishedStories: 3,
        drafts: 2,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'feedback',
          title: 'The Magic Forest',
          date: '2 days ago',
          message: 'Teacher Smith left feedback on your story.',
        },
        {
          id: '2',
          type: 'publish',
          title: 'Space Explorers',
          date: '1 week ago',
          message: 'Your story was published!',
        },
        {
          id: '3',
          type: 'draft',
          title: 'Mystery of the Lost Key',
          date: '2 weeks ago',
          message: 'You saved a draft of your story.',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'feedback':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'publish':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-muted-foreground">Stories you&apos;ve created</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedStories}</div>
            <p className="text-xs text-muted-foreground">Stories published</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">Stories in progress</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/student/write">
            <Button className="bg-ninja-crimson hover:bg-ninja-crimson/90">
              Write New Story
            </Button>
          </Link>
          <Link href="/student/my-stories">
            <Button variant="outline">
              View My Stories
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline">
              Explore Stories
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div key={activity.id} className="bg-gray-50 p-4 rounded-md flex items-start">
            <div className="mr-3 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.title}</span>: {activity.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Writing Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">Writing Tip of the Day</h3>
        <p className="text-sm">Start your story with a strong hook to grab your reader&apos;s attention. Consider beginning with action, dialogue, or an intriguing question.</p>
      </div>
    </div>
  );
}
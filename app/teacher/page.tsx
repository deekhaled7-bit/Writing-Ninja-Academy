'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award } from 'lucide-react';

type DashboardStats = {
  totalStudents: number;
  totalStories: number;
  pendingReviews: number;
};

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStories: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        totalStudents: 24,
        totalStories: 78,
        pendingReviews: 12,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students under your guidance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-muted-foreground">Stories created by your students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Stories waiting for your review</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm"><span className="font-medium">Sarah Johnson</span> submitted a new story <span className="font-medium">&quot;The Magic Tree&quot;</span> for review.</p>
          <p className="text-xs text-gray-500 mt-1">Today at 10:45 AM</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm"><span className="font-medium">Michael Brown</span> revised their story <span className="font-medium">&quot;Space Adventures&quot;</span> based on your feedback.</p>
          <p className="text-xs text-gray-500 mt-1">Yesterday at 3:20 PM</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm"><span className="font-medium">Emma Davis</span> joined your class.</p>
          <p className="text-xs text-gray-500 mt-1">2 days ago</p>
        </div>
      </div>
      
      {/* Teaching Resources */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Teaching Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Story Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Access creative writing prompts to inspire your students.</p>
            <button className="text-ninja-crimson text-sm mt-2 hover:underline">View Prompts</button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Feedback Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Use pre-made templates to provide consistent feedback.</p>
            <button className="text-ninja-crimson text-sm mt-2 hover:underline">View Templates</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalStories: number;
  totalTeachers: number;
  totalStudents: number;
  activeUsers: number;
  verifiedUsers: number;
  recentStories: number;
  totalReads: number;
  topStories: {
    _id: string;
    title: string;
    readCount: number;
    authorName?: string;
    coverImageUrl?: string;
    description: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStories: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    recentStories: 0,
    totalReads: 0,
    topStories: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-ninja-white">
              {stats.activeUsers} active • {stats.verifiedUsers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-ninja-white">
              {stats.recentStories} uploaded this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Award className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-ninja-white">Teacher accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-ninja-white">Student accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Story Reads
            </CardTitle>
            <Eye className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalReads.toLocaleString()}
            </div>
            <p className="text-xs text-ninja-white">Across all stories</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
            <Users className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-ninja-white">Active user rate</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Top Stories by Reads */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Top Stories by Reads
            </CardTitle>
            <Eye className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            {stats.topStories && stats.topStories.length > 0 ? (
              <div className="space-y-3">
                {stats.topStories.map((story, idx) => (
                  <Link
                    key={story._id}
                    href={`/stories/${story._id}`}
                    className="block hover:bg-ninja-cream/10 rounded-md transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between py-1 px-2">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ninja-peach text-ninja-black text-xs font-bold">
                          {idx + 1}
                        </span>
                        {/* Optional cover image */}
                        {story.coverImageUrl ? (
                          <img
                            src={story.coverImageUrl}
                            alt={story.title}
                            className="h-32 w-24 rounded-md object-cover bg-ninja-white border border-ninja-peach"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-ninja-cream border border-ninja-peach" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium  transition-colors">
                            {story.title}
                          </span>
                          <span className="text-sm text-ninja-light-gray">
                            {story.description}
                          </span>
                          {story.authorName && (
                            <span className="text-xs text-ninja-cream">
                              by {story.authorName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-ninja-crimson">
                        {story.readCount.toLocaleString()} reads
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No top stories data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stories uploaded this month</span>
                <span className="font-semibold text-ninja-crimson">
                  {stats.recentStories}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active users</span>
                <span className="font-semibold text-ninja-crimson">
                  {stats.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Verified users</span>
                <span className="font-semibold text-ninja-crimson">
                  {stats.verifiedUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total story reads</span>
                <span className="font-semibold text-ninja-crimson">
                  {stats.totalReads.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>Database connection: Active</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>API endpoints: Operational</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p>File uploads: Working</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award } from "lucide-react";

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
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/teacher/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch teacher stats");
          // Fallback to default values
          setStats({
            totalStudents: 0,
            totalStories: 0,
            pendingReviews: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching teacher stats:", error);
        // Fallback to default values
        setStats({
          totalStudents: 0,
          totalStories: 0,
          pendingReviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className=" bg-ninja-cream p-4">
      <h1 className="text-2xl font-bold mb-6 text-ninja-black">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-ninja-white">
              Students under your guidance
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
              Stories created by your students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Award className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-ninja-white">
              Stories waiting for your review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Sarah Johnson
                </span>{" "}
                submitted a new story{" "}
                <span className="font-medium text-ninja-crimson">
                  &quot;The Magic Tree&quot;
                </span>{" "}
                for review.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">
                Today at 10:45 AM
              </p>
            </div>

            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Michael Brown
                </span>{" "}
                revised their story{" "}
                <span className="font-medium text-ninja-crimson">
                  &quot;Space Adventures&quot;
                </span>{" "}
                based on your feedback.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">
                Yesterday at 3:20 PM
              </p>
            </div>

            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Emma Davis
                </span>{" "}
                joined your class.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">2 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

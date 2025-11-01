"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Star,
  Clock,
  User,
  BookMarked,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import FeaturedStories from "@/components/home/featured-stories";
import FeaturedStoriesAccount from "@/components/account/FeaturedstoriesAccount";
import RecentStoriesAccount from "@/components/account/RecentStoriesAccount";

type DashboardStats = {
  totalStories: number;
  publishedStories: number;
  drafts: number;
};

type RecentActivity = {
  id: string;
  type: "feedback" | "publish" | "draft";
  title: string;
  date: string;
  message?: string;
};

type BookAssignment = {
  _id: string;
  title: string;
  assignedDate: string;
  dueDate: string | null;
  isCompleted: boolean;
  readingProgress: number;
  lastReadDate: string | null;
  story: {
    _id: string;
    title: string;
    coverImage: string;
  };
  teacher: {
    _id: string;
    name: string;
  };
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalStories: 0,
    publishedStories: 0,
    drafts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [assignments, setAssignments] = useState<BookAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          // Fetch user's stories data
          const response = await fetch("/api/stories");
          if (response.ok) {
            const data = await response.json();
            const userStories =
              data.stories?.filter(
                (story: any) =>
                  story.author && story.author._id === session?.user?.id
              ) || [];

            const publishedStories = userStories.filter(
              (story: any) => story.isPublished
            );
            const draftStories = userStories.filter(
              (story: any) => !story.isPublished
            );

            setStats({
              totalStories: userStories.length,
              publishedStories: publishedStories.length,
              drafts: draftStories.length,
            });

            // Transform recent stories into activity items
            const recentActivities = userStories
              .sort(
                (a: any, b: any) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
              .slice(0, 3)
              .map((story: any) => ({
                id: story._id,
                type: story.isPublished ? "publish" : "draft",
                title: story.title,
                date: new Date(story.updatedAt).toLocaleDateString(),
                message: story.isPublished
                  ? "Your story was published!"
                  : "You saved a draft of your story.",
              }));

            setRecentActivity(recentActivities);
          }

          // Fetch assigned books
          const assignmentsResponse = await fetch(
            "/api/student/assigned-books"
          );
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            setAssignments(assignmentsData.assignments || []);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, session]);

  // Update reading progress
  const updateReadingProgress = async (
    assignmentId: string,
    progress: number,
    isCompleted: boolean = false
  ) => {
    try {
      const response = await fetch("/api/student/assigned-books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId,
          progress,
          isCompleted,
        }),
      });

      if (response.ok) {
        // Update the local state
        setAssignments((prevAssignments) =>
          prevAssignments.map((assignment) =>
            assignment._id === assignmentId
              ? {
                  ...assignment,
                  readingProgress: progress,
                  isCompleted: isCompleted || progress >= 100,
                  lastReadDate: new Date().toISOString(),
                }
              : assignment
          )
        );

        toast.success(
          isCompleted
            ? "Book marked as completed!"
            : "Reading progress updated!"
        );
      } else {
        toast.error("Failed to update reading progress");
      }
    } catch (error) {
      console.error("Error updating reading progress:", error);
      toast.error("An error occurred while updating progress");
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "feedback":
        return <Star className="h-4 w-4 text-ninja-peach" />;
      case "publish":
        return <BookOpen className="h-4 w-4 text-ninja-peach" />;
      case "draft":
        return <Clock className="h-4 w-4 text-ninja-peach" />;
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
      {session?.user ? (
        <div className="flex items-center mb-6">
          <div className="mr-4 relative group">
            <Link href="/student/profile">
              <Avatar className="h-32 w-32 border-4 border-ninja-crimson cursor-pointer hover:opacity-80 bg-ninja-white transition-opacity">
                <AvatarImage
                  src={
                    session?.user?.image || session?.user?.profilePicture || ""
                  }
                  alt={`${
                    session?.user?.firstName ||
                    (session?.user?.name ? session.user.name.split(" ")[0] : "")
                  } ${
                    session?.user?.lastName ||
                    (session?.user?.name &&
                    session.user.name.split(" ").length > 1
                      ? session.user.name.split(" ").slice(1).join(" ")
                      : "")
                  } profile picture`}
                />
                <AvatarFallback>
                  {session?.user?.firstName?.[0] ||
                    (session?.user?.name ? session.user.name[0] : "")}
                  {session?.user?.lastName?.[0] ||
                    (session?.user?.name &&
                    session.user.name.split(" ").length > 1
                      ? session.user.name.split(" ")[1][0]
                      : "")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Edit
              </div>
            </Link>
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold">
              Welcome,{" "}
              {session?.user?.firstName ||
                (session?.user?.name
                  ? session.user.name.split(" ")[0]
                  : "Student")}{" "}
              {session?.user?.lastName ||
                (session?.user?.name && session.user.name.split(" ").length > 1
                  ? session.user.name.split(" ").slice(1).join(" ")
                  : "")}
            </h1>
            <div className="flex items-center mt-1">
              <Badge variant="destructive" className="mr-2">
                Level {session?.user?.ninjaLevel || 1}
              </Badge>
              <Badge variant="secondary">
                {session?.user?.role || "Student"}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-ninja-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-ninja-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-ninja-white">
              Stories you&apos;ve created
            </p>
          </CardContent>
        </Card>

        <Card className="text-ninja-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Star className="h-4 w-4 text-ninja-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedStories}</div>
            <p className="text-xs text-ninja-white">Stories published</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-ninja-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-ninja-white">Stories in progress</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Assigned Books Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Assigned Books</h2>
          <Link href="/student/assigned-books">
            <Button variant="outline" size="sm">
              <BookMarked className="mr-2 h-4 w-4" />
              View All Assignments
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {assignments.filter((a) => !a.isCompleted).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments
                .filter((assignment) => !assignment.isCompleted)
                .slice(0, 3)
                .map((assignment) => (
                  <Card
                    key={assignment._id}
                    className="overflow-hidden bg-ninja-light-gray"
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={
                          assignment.story.coverImage ||
                          "/placeholder-cover.jpg"
                        }
                        alt={assignment.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-ninja-black">
                          {assignment.title}
                        </CardTitle>
                        {/* <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            {assignment.dueDate
                              ? new Date(
                                  assignment.dueDate
                                ).toLocaleDateString()
                              : "No due date"}
                          </Badge> */}
                      </div>
                      <p className="text-sm text-ninja-coral">
                        Assigned by: {assignment.teacher.name}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3 text-ninja-gray">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Reading Progress</span>
                          <span>{assignment.readingProgress}%</span>
                        </div>
                        <Progress
                          value={assignment.readingProgress}
                          className="h-2"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link
                          className="text-white"
                          href={`/stories/${assignment.story._id}?assignmentId=${assignment._id}`}
                        >
                          <Button variant="destructive" className="w-full">
                            Continue Reading
                          </Button>
                        </Link>

                        {/* <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateReadingProgress(
                                  assignment._id,
                                  Math.min(100, assignment.readingProgress + 25)
                                )
                              }
                            >
                              Update Progress (+25%)
                            </Button>

                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                updateReadingProgress(assignment._id, 100, true)
                              }
                            >
                              Mark Complete
                            </Button>
                          </div> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No active assignments</p>
          )}
        </div>
      </div>
      <FeaturedStoriesAccount />
      <RecentStoriesAccount />
      {/* Quick Actions */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/student/my-stories">
            <Button
              variant="outline"
              className="bg-ninja-crimson text-ninja-white"
            >
              View My Stories
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="outline"
              className="bg-ninja-crimson text-ninja-white"
            >
              Explore Stories
            </Button>
          </Link>
          <Link href="/student/profile">
            <Button
              variant="outline"
              className="bg-ninja-crimson text-ninja-white"
            >
              My Profile
            </Button>
          </Link>
        </div>
      </div> */}

      {/* Recent Activity */}
      {/* <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity) => (
          <div
            key={activity.id}
            className="bg-ninja-crimson p-4 rounded-md flex text-ninja-white items-start"
          >
            <div className="mr-3 mt-1">{getActivityIcon(activity.type)}</div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.title}</span>:{" "}
                {activity.message}
              </p>
              <p className="text-xs text-ninja-white mt-1">{activity.date}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* Writing Tips */}
      {/* <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">Writing Tip of the Day</h3>
        <p className="text-sm">
          Start your story with a strong hook to grab your reader&apos;s
          attention. Consider beginning with action, dialogue, or an intriguing
          question.
        </p>
      </div> */}
    </div>
  );
}

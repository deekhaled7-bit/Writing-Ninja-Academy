"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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

export default function AssignedBooks() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<BookAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/assigned-books");
      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const updateReadingProgress = async (
    assignmentId: string,
    progress: number,
    isCompleted = false
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

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment._id === assignmentId
            ? {
                ...assignment,
                readingProgress: progress,
                isCompleted: isCompleted || progress === 100,
                lastReadDate: isCompleted
                  ? new Date().toISOString()
                  : assignment.lastReadDate,
              }
            : assignment
        )
      );

      toast.success(
        isCompleted ? "Assignment marked as complete!" : "Progress updated!"
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
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
      <h1 className="text-2xl font-bold tracking-tight mb-6">Assigned Books</h1>
      <div>
        <Tabs defaultValue="active" className="w-full">
          {/* <TabsList className="mb-4">
            <TabsTrigger value="active">Active Assignments</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList> */}

          <TabsContent value="active">
            {assignments.filter((a) => !a.isCompleted).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments
                  .filter((assignment) => !assignment.isCompleted)
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
          </TabsContent>

          <TabsContent value="completed">
            {assignments.filter((a) => a.isCompleted).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments
                  .filter((assignment) => assignment.isCompleted)
                  .map((assignment) => (
                    <Card key={assignment._id} className="overflow-hidden">
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
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {assignment.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Assigned by: {assignment.teacher.name}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Completed on:</span>
                          <span>
                            {assignment.lastReadDate
                              ? new Date(
                                  assignment.lastReadDate
                                ).toLocaleDateString()
                              : "Unknown"}
                          </span>
                        </div>

                        <Link href={`/stories/${assignment.story._id}`}>
                          <Button variant="outline" className="w-full">
                            Read Again
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No completed assignments</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

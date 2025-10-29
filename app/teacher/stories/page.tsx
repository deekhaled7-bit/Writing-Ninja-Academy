"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, MessageSquare, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Story = {
  id: string;
  title: string;
  student: string;
  className: string;
  gradeName: string;
  status: "published" | "draft" | "review";
  submittedAt: string;
};

export default function TeacherStoriesPage() {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(
          `/api/teacher/stories?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch stories");
        }

        const data = await response.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error("Error fetching stories:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch stories";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [searchTerm, statusFilter, toast]);

  const handleReviewStory = (storyId: string) => {
    // In a real application, you would navigate to the story review page
    console.log(`Reviewing story ${storyId}`);
  };

  const handleViewStory = (storyId: string) => {
    // In a real application, you would navigate to the story detail page
    console.log(`Viewing story ${storyId}`);
  };

  // Filter stories based on search term and status filter
  // Note: Most filtering is now handled by the API, but we'll keep this for client-side filtering
  // in case we need to add more filters in the future
  const filteredStories = stories;

  const getStatusBadge = (status: Story["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
      case "review":
        return <Badge className="bg-yellow-500">Needs Review</Badge>;
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
        <h1 className="text-2xl font-bold">Student Stories</h1>
        <Button className="flex items-center gap-2" asChild>
          <Link href="/upload">
            <Upload className="h-4 w-4" />
            Upload Story
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            className="pl-8"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <select
          className="px-3 py-2 rounded-md border border-input bg-background"
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="review">Needs Review</option>
        </select>
      </div>

      <div className="rounded-md border max-w-[90vw] overflow-x-scroll">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class-Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ninja-crimson mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading stories...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.student}</TableCell>
                  <TableCell>
                    {story.className && story.gradeName
                      ? `${story.className} - ${story.gradeName}`
                      : "Not assigned"}
                  </TableCell>
                  <TableCell>{getStatusBadge(story.status)}</TableCell>
                  <TableCell>{story.submittedAt}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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

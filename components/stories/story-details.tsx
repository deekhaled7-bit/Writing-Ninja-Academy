"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Heart,
  MessageCircle,
  Clock,
  User,
  Star,
  FileText,
  Video,
  ChevronLeft,
  Send,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import VideoPlayer from "@/components/stories/video-player";
import FlipBook from "./FlipBook";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from "next/navigation";
import CommentSection from "@/app/stories/CommentSection";

// Dynamically import PDFViewer with no SSR to avoid DOM API issues
const PDFViewer = dynamic(() => import("@/components/stories/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ninja-crimson mx-auto mb-4"></div>
      <p className="text-ninja-gray">Loading PDF viewer...</p>
    </div>
  ),
});

interface Story {
  _id: string;
  title: string;
  description: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
    ninjaLevel: number;
  };
  authorName: string;
  ageGroup: string;
  category: string;
  fileType: string;
  fileUrl: string;
  coverImageUrl?: string;
  readCount: number;
  completedCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags?: string[];
}

interface Comment {
  _id: string;
  author: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface StoryDetailsProps {
  story: Story;
  comments: Comment[];
}

export default function StoryDetails({
  story,
  comments: initialComments,
}: StoryDetailsProps) {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Track read when component mounts
    handleInteraction("read");
  }, []);

  const handleInteraction = async (action: "read" | "completed" | "like") => {
    try {
      const response = await fetch(`/api/stories/${story._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        if (action === "like") {
          setIsLiked(!isLiked);
          toast({
            title: isLiked ? "Removed like" : "Liked story",
            description: isLiked
              ? "You removed your like from this story."
              : "You liked this story!",
          });
        } else if (action === "completed") {
          setHasCompleted(true);
          toast({
            title: "Story completed!",
            description:
              "Great job finishing this story! You earned 5 ninja gold.",
          });
        }
      }
    } catch (error) {
      console.error("Error handling interaction:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/stories/${story._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        toast({
          title: "Comment added!",
          description: "Your comment has been posted successfully.",
        });
      } else {
        throw new Error("Failed to submit comment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      fantasy: "bg-purple-100 text-purple-800",
      adventure: "bg-green-100 text-green-800",
      mystery: "bg-blue-100 text-blue-800",
      "science-fiction": "bg-indigo-100 text-indigo-800",
      friendship: "bg-pink-100 text-pink-800",
      family: "bg-orange-100 text-orange-800",
      animals: "bg-emerald-100 text-emerald-800",
      school: "bg-yellow-100 text-yellow-800",
      humor: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-ninja-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/explore"
          className="inline-flex items-center text-ninja-gray hover:text-ninja-crimson transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Stories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Story Header */}
            <div className="ninja-scroll p-8 mb-8">
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className={getCategoryColor(story.category)}>
                  {story.category.replace("-", " ")}
                </Badge>
                <Badge variant="outline">{story.ageGroup} years</Badge>
                <div className="flex items-center gap-1 text-ninja-gray">
                  {story.fileType === "video" ? (
                    <>
                      <Video className="h-4 w-4" /> Video Story
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> PDF Story
                    </>
                  )}
                </div>
              </div>

              <h1 className="font-oswald text-3xl sm:text-4xl text-ninja-black mb-4">
                {story.title}
              </h1>

              <p className="text-ninja-gray text-lg leading-relaxed mb-6">
                {story.description}
              </p>

              {/* Cover Image */}
              {story.coverImageUrl && (
                <div className="mb-6">
                  <div className="relative w-full max-w-md mx-auto">
                    <Image
                      src={story.coverImageUrl}
                      alt={`Cover image for ${story.title}`}
                      width={400}
                      height={600}
                      className="rounded-lg shadow-lg object-cover w-full h-auto"
                      style={{ aspectRatio: "2/3" }}
                    />
                  </div>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ninja-gray border-opacity-20">
                <div className="w-12 h-12 bg-ninja-gold rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-ninja-black" />
                </div>
                <div>
                  <div className="font-semibold text-ninja-black">
                    {story.authorName}
                  </div>
                  <div className="text-sm text-ninja-gray flex items-center gap-2">
                    <Star className="h-3 w-3 text-ninja-gold fill-current" />
                    Level {story.author.ninjaLevel} Ninja
                  </div>
                </div>
                <div className="ml-auto text-sm text-ninja-gray">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatDate(story.createdAt)}
                </div>
              </div>

              {/* Stats */}
              <CommentSection storyId={story._id}></CommentSection>
              {/* <div className="flex items-center gap-6 text-ninja-gray">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {story.readCount} reads
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {story.likeCount} likes
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {story.commentCount} comments
                </div>
              </div> */}
            </div>

            {/* Story Content */}
            <div className="ninja-scroll p-8 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-oswald text-2xl text-ninja-black">
                  Read the Story
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="flex items-center gap-1"
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      Exit Full Screen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      Full Screen
                    </>
                  )}
                </Button>
              </div>

              <div
                className={
                  isFullScreen
                    ? "fixed inset-0 z-50 bg-white flex flex-col p-4"
                    : ""
                }
              >
                {isFullScreen && (
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullScreen(false)}
                      className="flex items-center gap-1"
                    >
                      <Minimize2 className="h-4 w-4" />
                      Exit Full Screen
                    </Button>
                  </div>
                )}

                <div
                  className={
                    isFullScreen
                      ? "flex-1 flex items-center justify-center"
                      : ""
                  }
                >
                  <FlipBook
                    storyId={story._id}
                    fileUrl={story.fileUrl}
                    cover={story.coverImageUrl || ""}
                    onProgress={(cur, total) => {
                      setCurrentPage(cur);
                      setTotalPages(total);

                      // Automatically mark as completed when user reaches 90% of the book
                      const completionThreshold = Math.floor(total * 0.9);
                      console.log(
                        `Progress: ${cur}/${total}, Threshold: ${completionThreshold}, Completed: ${hasCompleted}`
                      );

                      if (
                        total > 0 &&
                        cur >= completionThreshold &&
                        !hasCompleted
                      ) {
                        console.log("Marking story as completed");
                        setHasCompleted(true); // Directly update state for immediate UI update
                        handleInteraction("completed");
                      }
                    }}
                  />
                </div>

                {totalPages > 0 && (
                  <div
                    className={`mt-4 ${isFullScreen ? "max-w-xl mx-aut" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2 text-sm text-ninja-gray">
                      <span>
                        Page {currentPage} / {totalPages}
                      </span>
                      <span>
                        {Math.round((currentPage / totalPages) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(currentPage / totalPages) * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {/* <div className="flex flex-wrap gap-4 mt-6">
                <Button
                  onClick={() => handleInteraction("like")}
                  variant={isLiked ? "default" : "outline"}
                  className={
                    isLiked
                      ? "bg-ninja-crimson hover:bg-red-600"
                      : "border-ninja-crimson text-ninja-crimson hover:bg-ninja-crimson hover:text-ninja-white"
                  }
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                  />
                  {isLiked ? "Liked" : "Like Story"}
                </Button>

               
              </div> */}
            </div>

            {/* Comments Section */}
            {/* <div className="ninja-scroll p-8">
              <h2 className="font-oswald text-2xl text-ninja-black mb-6">
                Comments ({comments.length})
              </h2>

              <form onSubmit={handleCommentSubmit} className="mb-8">
                <Textarea
                  placeholder="Share your thoughts about this story..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="bg-ninja-crimson hover:bg-red-600 text-ninja-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </form>

              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border-b border-ninja-gray border-opacity-20 pb-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-ninja-gold rounded-full flex items-center justify-center">
                          <span className="text-ninja-black text-sm font-semibold">
                            {comment.authorName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-ninja-black">
                            {comment.authorName}
                          </div>
                          <div className="text-xs text-ninja-gray">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <p className="text-ninja-gray leading-relaxed ml-11">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-ninja-gray text-center py-8">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div> */}
            {hasCompleted && session?.user && (
              <Link href={`/quiza/${story._id}`}>
                <Button className="bg-ninja-black hover:bg-blue-600 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Story Info */}
            <div className="ninja-scroll p-6">
              <h3 className="font-oswald text-xl text-ninja-black mb-4">
                Story Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-ninja-black">
                    Category:
                  </span>
                  <span className="ml-2 text-ninja-gray capitalize">
                    {story.category.replace("-", " ")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-ninja-black">
                    Age Group:
                  </span>
                  <span className="ml-2 text-ninja-gray">
                    {story.ageGroup} years
                  </span>
                </div>
                <div>
                  <span className="font-medium text-ninja-black">Format:</span>
                  <span className="ml-2 text-ninja-gray capitalize">
                    {story.fileType}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-ninja-black">
                    Published:
                  </span>
                  <span className="ml-2 text-ninja-gray">
                    {formatDate(story.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Actions */}
            <div className="ninja-scroll p-6">
              <h3 className="font-oswald text-xl text-ninja-black mb-4">
                More Actions
              </h3>
              <div className="space-y-3">
                <Link href={`/authors/${story.author._id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    View Author&apos;s Stories
                  </Button>
                </Link>
                <Link href={`/explore?category=${story.category}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    More {story.category.replace("-", " ")} Stories
                  </Button>
                </Link>
                <Link href={`/explore?ageGroup=${story.ageGroup}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    More Stories for {story.ageGroup} Years
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

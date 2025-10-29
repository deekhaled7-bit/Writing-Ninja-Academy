"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Search,
  Eye,
  Trash2,
  Upload,
  Check,
  Download,
  Edit,
  X,
  Save,
  FileUp,
  Loader2,
  Star,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { directCloudinaryUpload } from "@/utils/directCloudinaryUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "fantasy", label: "Fantasy" },
  { value: "adventure", label: "Adventure" },
  { value: "mystery", label: "Mystery" },
  { value: "science-fiction", label: "Science Fiction" },
  { value: "friendship", label: "Friendship" },
  { value: "family", label: "Family" },
  { value: "animals", label: "Animals" },
  { value: "school", label: "School" },
  { value: "humor", label: "Humor" },
  { value: "other", label: "Other" },
];

type Story = {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  status: "published" | "draft" | "review" | "waiting_revision" | "rejected";
  createdAt: string;
  pdfUrl?: string;
  description?: string;
  category?: string;
  tags?: string[];
  featured: Boolean;
  coverImageUrl?: string;
  ageGroup?: string;
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    coverImageUrl: "",
    ageGroup: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [coverImageDragActive, setCoverImageDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCoverImageDragActive(true);
    } else if (e.type === "dragleave") {
      setCoverImageDragActive(false);
    }
  };

  const handleCoverImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverImageDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverImageSelection(e.dataTransfer.files[0]);
    }
  };

  const handleCoverImageSelection = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid image type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    setCoverImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setEditFormData({ ...editFormData, coverImageUrl: imageUrl });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCoverImageSelection(e.target.files[0]);
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Use admin-specific API endpoint
        const response = await fetch("/api/admin/stories");
        if (!response.ok) {
          throw new Error("Failed to fetch stories");
        }
        const data = await response.json();

        // Transform the data to match our Story type
        const formattedStories = data.stories.map((story: any) => ({
          id: story._id,
          title: story.title,
          author:
            story.author?.firstName && story.author?.lastName
              ? `${story.author.firstName} ${story.author.lastName}`
              : "Unknown",
          authorEmail: story.author?.email || "N/A",
          status: story.isPublished ? "published" : story.status || "draft",
          createdAt: new Date(story.createdAt).toLocaleDateString(),
          pdfUrl: story.pdfUrl || story.fileUrl || "",
          description: story.description || "",
          category: story.category || "",
          tags: story.tags || [],
          coverImageUrl: story.coverImageUrl || "",
          ageGroup: story.ageGroup || "",
        }));

        setStories(formattedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
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
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete story");
      }

      // Update local state
      setStories(stories.filter((story) => story.id !== storyId));

      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting story:", error);
      toast({
        title: "Error",
        description: "Failed to delete the story. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeStoryStatus = async (
    storyId: string,
    newStatus: Story["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/stories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change story status to ${newStatus}`);
      }

      // Update local state
      setStories(
        stories.map((story) =>
          story.id === storyId ? { ...story, status: newStatus } : story
        )
      );

      toast({
        title: `Story ${newStatus === "published" ? "published" : "updated"}`,
        description: `The story has been ${
          newStatus === "published" ? "published" : `marked as ${newStatus}`
        } successfully.`,
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

  const handlePublishStory = (storyId: string) =>
    handleChangeStoryStatus(storyId, "published");

  const handleUnpublishStory = (storyId: string) =>
    handleChangeStoryStatus(storyId, "draft");

  const handleReviewStory = (storyId: string) =>
    handleChangeStoryStatus(storyId, "review");

  const handleViewStory = (storyId: string) => {
    // Navigate to the story detail page
    window.open(`/stories/${storyId}`, "_blank");
  };

  const handleEditStory = (story: Story) => {
    setCurrentStory(story);
    setEditFormData({
      title: story.title,
      description: story.description || "",
      category: story.category || "",
      ageGroup: story.ageGroup || "",
      tags: story.tags?.join(", ") || "",
      coverImageUrl: story.coverImageUrl || "",
    });
    setCoverImageFile(null);
    setCoverImageDragActive(false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentStory) return;

    try {
      setIsLoading(true);
      // Show loading toast
      toast({
        title: "Updating story",
        description: "Please wait while the story is being updated...",
      });

      // First update the story details
      const response = await fetch(`/api/admin/stories/${currentStory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          category: editFormData.category,
          ageGroup: editFormData.ageGroup,
          tags: editFormData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          coverImageUrl: editFormData.coverImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update story");
      }

      const data = await response.json();
      let updatedCoverImageUrl = editFormData.coverImageUrl;

      // If there's a new cover image file, upload it
      if (coverImageFile) {
        setIsUploadingImage(true);
        toast({
          title: "Uploading image",
          description: "Please wait while the cover image is being uploaded...",
        });

        const formData = new FormData();
        formData.append("file", coverImageFile);
        formData.append("storyId", currentStory.id);

        const imageUploadResponse = await fetch(
          "/api/admin/stories/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.json();
          throw new Error(errorData.error || "Failed to upload cover image");
        }

        const imageData = await imageUploadResponse.json();
        updatedCoverImageUrl = imageData.coverImageUrl;

        toast({
          title: "Image uploaded",
          description: "The cover image has been uploaded successfully.",
        });
        setIsUploadingImage(false);
      }

      // Update local state with data from the server
      setStories(
        stories.map((story) =>
          story.id === currentStory.id
            ? {
                ...story,
                title: editFormData.title,
                description: editFormData.description,
                category: editFormData.category,
                ageGroup: editFormData.ageGroup,
                tags: editFormData.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag),
                coverImageUrl: updatedCoverImageUrl,
              }
            : story
        )
      );

      // Reset the file state
      setCoverImageFile(null);

      setEditDialogOpen(false);
      toast({
        title: "Story updated",
        description: "The story has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating story:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update the story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploadingImage(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handleDownloadPdf = async (storyId: string) => {
    try {
      setIsLoading(true);
      const story = stories.find((s) => s.id === storyId);
      if (!story) {
        throw new Error("Story not found");
      }

      if (!story.pdfUrl) {
        toast({
          title: "PDF not available",
          description:
            "This story doesn't have a PDF file available for download.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Downloading PDF",
        description: "Please wait while we prepare your download...",
      });

      // Fetch the PDF file
      const response = await fetch(story.pdfUrl);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${story.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Download complete",
        description: "The PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (storyId: string) => {
    try {
      const story = stories.find((s) => s.id === storyId);
      if (!story) {
        throw new Error("Story not found");
      }

      const newFeaturedStatus = !story.featured;

      const response = await fetch(`/api/admin/stories/${storyId}/featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured: newFeaturedStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update featured status");
      }

      // Update the story in the local state
      setStories(
        stories.map((s) =>
          s.id === storyId ? { ...s, featured: newFeaturedStatus } : s
        )
      );

      toast({
        title: "Success",
        description: `Story ${
          newFeaturedStatus ? "marked as featured" : "removed from featured"
        }`,
      });
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadPdfClick = (story: Story) => {
    setCurrentStory(story);
    setUploadDialogOpen(true);
  };

  const handlePdfFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!currentStory || !event.target.files || event.target.files.length === 0)
      return;

    const file = event.target.files[0];
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: "Uploading PDF",
        description: "Please wait while the PDF is being uploaded...",
        duration: 5000,
      });

      setIsUploadingPdf(true);

      // Upload directly to Cloudinary from the browser
      // const fileUploadResult = await directCloudinaryUpload(file, {
      //   uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
      //   folder: "writing-ninja-stories",
      // });
      const fileUploadResult = await directCloudinaryUpload(file, {
        uploadPreset: process.env
          .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
        folder: "writing-ninja-stories",
        resourceType: "raw",
        onProgress: (progress) => {
          toast({
            title: `Uploading: ${progress}%`,
            description: "Please wait while we upload your file...",
          });
        },
      });

      if (!fileUploadResult || !fileUploadResult.secure_url) {
        throw new Error("Failed to upload PDF to Cloudinary");
      }

      // Now update the story with the new PDF URL
      const response = await fetch(`/api/admin/stories/${currentStory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: fileUploadResult.secure_url,
          publicId: fileUploadResult.public_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update story with new PDF URL"
        );
      }

      const data = await response.json();

      // Update local state
      setStories(
        stories.map((story) =>
          story.id === currentStory.id
            ? {
                ...story,
                pdfUrl: fileUploadResult.secure_url,
              }
            : story
        )
      );

      setUploadDialogOpen(false);
      toast({
        title: "PDF uploaded",
        description: "The PDF has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to upload the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Filter stories based on search term
  const filteredStories = stories.filter((story) => {
    return (
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.authorEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: Story["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">Draft</Badge>;
      case "review":
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "waiting_revision":
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

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditStory(story)}
                      title="Edit Story Details"
                    >
                      <Edit className="h-4 w-4 text-purple-500" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadPdf(story.id)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 text-blue-700" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(story.id)}
                      title={
                        story.featured
                          ? "Remove from featured"
                          : "Mark as featured"
                      }
                    >
                      {story.featured ? (
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUploadPdfClick(story)}
                      title="Upload New PDF"
                    >
                      <FileUp className="h-4 w-4 text-orange-500" />
                    </Button>

                    {/* Review button for draft stories */}
                    {story.status === "draft" && (
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
                    {(story.status === "review" ||
                      story.status === "waiting_revision") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePublishStory(story.id)}
                        title="Publish Story"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}

                    {/* Unpublish button for published stories */}
                    {story.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnpublishStory(story.id)}
                        title="Unpublish Story"
                      >
                        <X className="h-4 w-4 text-red-500" />
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

      {/* Edit Story Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Story Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="Enter story title"
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter story description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="mb-2 block">
                    Category
                  </Label>
                  <Select
                    value={editFormData.category}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="coverImage" className="mb-2 block">
                  Cover Image
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    coverImageDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-300"
                  }`}
                  onDragEnter={handleCoverImageDrag}
                  onDragOver={handleCoverImageDrag}
                  onDragLeave={handleCoverImageDrag}
                  onDrop={handleCoverImageDrop}
                >
                  {editFormData.coverImageUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={editFormData.coverImageUrl}
                        alt="Cover preview"
                        className="h-40 w-auto object-cover rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleCoverImageChange}
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          size="sm"
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Click to upload your cover image
                      </p>
                      <Input
                        id="coverImage"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleCoverImageChange}
                        ref={fileInputRef}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isLoading || isUploadingImage}
            >
              {isLoading || isUploadingImage ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload PDF Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload New PDF</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pdf-file">Select PDF File</Label>
              <Input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handlePdfFileChange}
                disabled={isUploadingPdf}
              />
            </div>
            {isUploadingPdf && (
              <div className="flex justify-center items-center py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading PDF...</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={isUploadingPdf}
            >
              Cancel
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPdf}
            >
              {isUploadingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload PDF"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

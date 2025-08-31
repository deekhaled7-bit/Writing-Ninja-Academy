"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Video, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

const ageGroups = [
  { value: "5-8", label: "5-8 years" },
  { value: "9-12", label: "9-12 years" },
  { value: "13-17", label: "13-17 years" },
];

export default function UploadStoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ageGroup: "",
    category: "",
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "video/mp4",
      "video/mov",
      "video/avi",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or video file (MP4, MOV, AVI).",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.ageGroup ||
      !formData.category
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF or video file to upload.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("ageGroup", formData.ageGroup);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("file", selectedFile);

      const response = await fetch("/api/stories", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Story uploaded successfully!",
          description:
            "Your story has been shared with the community. You earned 10 ninja gold!",
        });
        router.push(`/stories/${data.story._id}`);
      } else {
        throw new Error(data.error || "Failed to upload story");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          "There was an error uploading your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) {
      return <Video className="h-8 w-8 text-ninja-crimson" />;
    }
    return <FileText className="h-8 w-8 text-ninja-crimson" />;
  };

  return (
    <div className="ninja-scroll p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Story Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-ninja-black font-semibold">
              Story Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter your story title..."
              maxLength={100}
              required
            />
            <p className="text-sm text-ninja-gray">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ageGroup"
              className="text-ninja-black font-semibold"
            >
              Age Group *
            </Label>
            <Select
              value={formData.ageGroup}
              onValueChange={(value) =>
                setFormData({ ...formData, ageGroup: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target age group" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-ninja-black font-semibold"
            >
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select story category" />
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

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-ninja-black font-semibold"
          >
            Story Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell us about your story... What happens? Who are the characters? What makes it special?"
            rows={4}
            maxLength={500}
            required
          />
          <p className="text-sm text-ninja-gray">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <Label className="text-ninja-black font-semibold">
            Upload Your Story *
          </Label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-ninja-crimson bg-red-50"
                : selectedFile
                ? "border-ninja-gold bg-yellow-50"
                : "border-ninja-gray hover:border-ninja-crimson"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-ninja-gold mx-auto" />
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {getFileIcon(selectedFile)}
                    <span className="font-medium text-ninja-black">
                      {selectedFile.name}
                    </span>
                  </div>
                  <p className="text-sm text-ninja-gray">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 text-ninja-gray mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-oswald text-xl text-ninja-black">
                    Drop your story here
                  </h3>
                  <p className="text-ninja-gray">or click to browse files</p>
                  <p className="text-sm text-ninja-gray">
                    Supported formats: PDF, MP4, MOV, AVI (max 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.mp4,.mov,.avi"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-ninja-crimson text-ninja-crimson hover:bg-ninja-crimson hover:text-ninja-white"
                    asChild
                  >
                    <span>Browse Files</span>
                  </Button>
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-ninja-light-gray p-6 rounded-lg border border-ninja-gold">
          <h3 className="font-oswald text-lg text-ninja-black mb-3">
            📝 Story Guidelines
          </h3>
          <ul className="text-sm text-ninja-gray space-y-2">
            <li>• Stories should be original and written by you</li>
            <li>• Keep content appropriate for your selected age group</li>
            <li>• Be respectful and kind in your stories</li>
            <li>• PDF files should be clear and readable</li>
            <li>• Videos should have good audio quality</li>
            <li>• Maximum file size: 50MB</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={loading}
            className="bg-ninja-crimson hover:bg-red-600 text-ninja-white px-8 py-4 text-lg font-semibold min-w-[200px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading Story...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Share Your Story
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function WriteStoryPage() {
  const [storyData, setStoryData] = useState({
    title: "",
    content: "",
    tags: "",
    coverImage: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStoryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStoryData((prev) => ({
        ...prev,
        coverImage: e.target.files![0],
      }));
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // In a real application, you would save the draft to your API
    // For now, we'll simulate a successful save
    setTimeout(() => {
      toast({
        title: "Draft Saved",
        description: "Your story draft has been saved successfully.",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!storyData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your story.",
        variant: "destructive",
      });
      return;
    }

    if (!storyData.content.trim() || storyData.content.length < 50) {
      toast({
        title: "Error",
        description:
          "Your story content is too short. Please write at least 50 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // In a real application, you would submit the story for review to your API
    // For now, we'll simulate a successful submission
    setTimeout(() => {
      toast({
        title: "Story Submitted",
        description:
          "Your story has been submitted for review. Your teacher will provide feedback soon.",
      });
      setIsSubmitting(false);
      // In a real application, you would redirect to the stories list
      // router.push('/student/my-stories');
    }, 1500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Write a New Story</h1>

      <form onSubmit={handleSubmitForReview}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a captivating title"
              value={storyData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Story Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Once upon a time..."
              value={storyData.content}
              onChange={handleInputChange}
              className="min-h-[300px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="adventure, fantasy, friendship"
              value={storyData.tags}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image (optional)</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {storyData.coverImage && (
              <p className="text-sm text-gray-500">
                Selected file: {storyData.coverImage.name}
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>

            <Button
              type="submit"
              className="bg-ninja-crimson hover:bg-ninja-crimson/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </div>
      </form>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Writing Tips</h3>
          <ul className="text-sm space-y-2 list-disc pl-5">
            <li>Start with a strong opening that hooks your reader.</li>
            <li>Create interesting characters with unique personalities.</li>
            <li>
              Show, don&apos;t tell - use descriptive language to paint a
              picture.
            </li>
            <li>Include dialogue to bring your characters to life.</li>
            <li>End your story with a satisfying conclusion.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

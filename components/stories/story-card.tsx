"use client";

import Link from "next/link";
import { Eye, Heart, Clock, FileText, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Story } from "@/app/interfaces/interface";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/stories/${story._id}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={story.coverImageUrl}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Image";
            }}
          />

          {/* File Type Badge */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 text-white bg-black bg-opacity-60 rounded-full px-2 py-1">
              {story.fileType === "video" ? (
                <Video className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
            </div>
          </div>

          {/* Age Group Badge */}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="text-xs bg-white bg-opacity-90 text-gray-800"
            >
              {story.ageGroup}+
            </Badge>
          </div>

          {/* Bottom Overlay with Title */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
            <h3 className="font-oswald text-white text-sm font-bold line-clamp-2 mb-1">
              {story.title}
            </h3>
            <p className="text-white/80 text-xs">By {story.authorName}</p>
          </div>

          {/* Hover Stats Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white rounded-lg p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{story.readCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{story.likeCount}</span>
                </div>
              </div>
              <div className="mt-2">
                <Badge className={getCategoryColor(story.category)}>
                  {story.category.replace("-", " ")}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

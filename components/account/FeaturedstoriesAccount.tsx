"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoryCard from "@/components/stories/story-card";

interface Story {
  _id: string;
  title: string;
  description: string;
  authorName: string;
  ageGroup: string;
  category: string;
  readCount: number;
  likeCount: number;
  createdAt: string;
  fileType: string;
  coverImageUrl: string;
  fileUrl: string;
  featured?: boolean;
}

export default function FeaturedStoriesAccount() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const response = await fetch("/api/stories/featured");
        if (!response.ok) {
          throw new Error("Failed to fetch featured stories");
        }
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error("Error fetching featured stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStories();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto ">
          <div className="text-start mb-16">
            <h2 className="font-oswald text-xl sm:text-2xl text-ninja-black mb-4">
              Featured Stories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ninja-scroll p-6 animate-pulse">
                <div className="h-4 bg-ninja-gray bg-opacity-30 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-ninja-gray bg-opacity-20 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-ninja-gray bg-opacity-20 rounded w-2/3 mb-4"></div>
                <div className="h-20 bg-ninja-gray bg-opacity-10 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-ninja-gray bg-opacity-20 rounded w-1/3"></div>
                  <div className="h-3 bg-ninja-gray bg-opacity-20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-ninja-white border-b-2 ">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-start mb-16"
        >
          <h2 className="font-oswald text-xl sm:text-2xl text-ninja-black mb-4">
            Featured Stories
          </h2>
          {/* <p className="text-xl text-ninja-gray max-w-3xl mx-auto">
            Discover the most popular and recent stories from our community of
            young writers!
          </p> */}
        </motion.div>

        {stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-6 mb-12">
              {stories.slice(0, 4).map((story, index) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <StoryCard story={story} />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="bg-ninja-crimson hover:bg-red-600 text-ninja-white px-8 py-4 ninja-hover group"
                >
                  Explore All Stories
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-ninja-gray bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-12 w-12 text-ninja-gray opacity-50" />
              </div>
              <h3 className="font-oswald text-2xl text-ninja-gray mb-2">
                No Stories Yet
              </h3>
              <p className="text-ninja-gray opacity-80">
                Be the first ninja to share a story with our community!
              </p>
            </div>
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-ninja-crimson hover:bg-red-600 text-ninja-white px-8 py-4"
              >
                Upload the First Story
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

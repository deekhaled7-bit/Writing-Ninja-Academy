'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Heart, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StoryCard from '@/components/stories/story-card';

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
  coverImageUrl:string;
  fileUrl:string;
}

// Featured mock stories for the home page
const featuredStories: Story[] = [
  {
    _id: '11',
    title: 'Quest for the Golden Compass',
    description: 'A group of young explorers must navigate treacherous mountains and solve ancient riddles to find a legendary treasure.',
    authorName: 'Ethan Brown',
    ageGroup: '13-17',
    category: 'adventure',
    readCount: 3456,
    likeCount: 278,
    createdAt: '2023-12-20T10:00:00Z',
    fileType: 'video',
    coverImageUrl: '/stories/time-backpack.svg',
    fileUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    _id: '6',
    title: 'My Robot Best Friend',
    description: 'A lonely teenager builds a robot companion, but things get complicated when the robot develops feelings.',
    authorName: 'Sarah Kim',
    ageGroup: '13-17',
    category: 'science-fiction',
    readCount: 2341,
    likeCount: 189,
    createdAt: '2024-01-03T13:20:00Z',
    fileType: 'pdf',
    coverImageUrl: '/stories/robot-friend.svg',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    _id: '9',
    title: 'The New Kid\'s Superpower',
    description: 'Starting at a new school is hard, but it\'s even harder when you accidentally reveal you can read minds.',
    authorName: 'Jordan Smith',
    ageGroup: '13-17',
    category: 'school',
    readCount: 2987,
    likeCount: 234,
    createdAt: '2023-12-25T15:45:00Z',
    fileType: 'pdf',
    coverImageUrl: '/stories/space-pirates.svg',
    fileUrl: 'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf'
  },
  {
    _id: '2',
    title: 'Space Pirates of Nebula Seven',
    description: 'Captain Alex and their crew must outsmart alien pirates to save their home planet from destruction.',
    authorName: 'Marcus Rodriguez',
    ageGroup: '9-12',
    category: 'science-fiction',
    readCount: 2156,
    likeCount: 134,
    createdAt: '2024-01-12T14:20:00Z',
    fileType: 'video',
    coverImageUrl: '/stories/space-pirates.svg',
    fileUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    _id: '5',
    title: 'The Time-Traveling Backpack',
    description: 'When Jake finds an old backpack in his attic, he discovers it can transport him to any time period in history.',
    authorName: 'David Park',
    ageGroup: '9-12',
    category: 'adventure',
    readCount: 1876,
    likeCount: 145,
    createdAt: '2024-01-05T11:30:00Z',
    fileType: 'video',
    coverImageUrl: '/stories/time-backpack.svg',
    fileUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    _id: '12',
    title: 'The Singing Whale\'s Message',
    description: 'A marine biologist\'s daughter discovers she can understand whale songs and learns about an underwater crisis.',
    authorName: 'Chloe Anderson',
    ageGroup: '9-12',
    category: 'animals',
    readCount: 1789,
    likeCount: 134,
    createdAt: '2023-12-18T14:30:00Z',
    fileType: 'pdf',
    coverImageUrl: '/stories/dragon-garden.svg',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

export default function FeaturedStories() {
  const [stories] = useState<Story[]>(featuredStories);
  const [loading] = useState(false);

  if (loading) {
    return (
      <section className="py-20 bg-ninja-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-ninja text-4xl sm:text-5xl text-ninja-black mb-4">
              Featured Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
    <section className="py-20 bg-ninja-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-ninja text-4xl sm:text-5xl text-ninja-black mb-4">
            Featured Stories
          </h2>
          <p className="text-xl text-ninja-gray max-w-3xl mx-auto">
            Discover the most popular and recent stories from our community of young writers!
          </p>
        </motion.div>

        {stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
              {stories.map((story, index) => (
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
              <h3 className="font-ninja text-2xl text-ninja-gray mb-2">No Stories Yet</h3>
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
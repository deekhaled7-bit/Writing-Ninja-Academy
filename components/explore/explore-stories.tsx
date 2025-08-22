"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StoryCard from "@/components/stories/story-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Story } from "@/app/interfaces/interface";

interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
}

// Mock data for demonstration
const mockStories: Story[] = [
  {
    _id: "1",
    title: "The Dragon's Secret Garden",
    description:
      "A young girl discovers a hidden garden where a friendly dragon grows magical flowers that can heal any wound.",
    authorName: "Emma Chen",
    ageGroup: "5-8",
    category: "fantasy",
    readCount: 1247,
    likeCount: 89,
    createdAt: "2024-01-15T10:30:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/dragon-garden.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "2",
    title: "Space Pirates of Nebula Seven",
    description:
      "Captain Alex and their crew must outsmart alien pirates to save their home planet from destruction.",
    authorName: "Marcus Rodriguez",
    ageGroup: "9-12",
    category: "science-fiction",
    readCount: 2156,
    likeCount: 134,
    createdAt: "2024-01-12T14:20:00Z",
    fileType: "video",
    coverImageUrl: "/stories/space-pirates.svg",
    fileUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  },
  {
    _id: "3",
    title: "The Mystery of the Missing Homework",
    description:
      "When homework starts disappearing from lockers, detective duo Sam and Riley must solve the case before the big test.",
    authorName: "Zoe Williams",
    ageGroup: "9-12",
    category: "mystery",
    readCount: 987,
    likeCount: 67,
    createdAt: "2024-01-10T09:15:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/time-backpack.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "4",
    title: "Bella the Brave Bunny",
    description:
      "A little bunny learns to overcome her fears when she must rescue her friends from the dark forest.",
    authorName: "Lily Thompson",
    ageGroup: "5-8",
    category: "animals",
    readCount: 1543,
    likeCount: 112,
    createdAt: "2024-01-08T16:45:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/brave-bunny.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "5",
    title: "The Time-Traveling Backpack",
    description:
      "When Jake finds an old backpack in his attic, he discovers it can transport him to any time period in history.",
    authorName: "David Park",
    ageGroup: "9-12",
    category: "adventure",
    readCount: 1876,
    likeCount: 145,
    createdAt: "2024-01-05T11:30:00Z",
    fileType: "video",
    coverImageUrl: "/stories/time-backpack.svg",
    fileUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  },
  {
    _id: "6",
    title: "My Robot Best Friend",
    description:
      "A lonely teenager builds a robot companion, but things get complicated when the robot develops feelings.",
    authorName: "Sarah Kim",
    ageGroup: "13-17",
    category: "science-fiction",
    readCount: 2341,
    likeCount: 189,
    createdAt: "2024-01-03T13:20:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/robot-friend.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "7",
    title: "The Laughing Potion",
    description:
      "A young wizard's spell goes wrong, making everyone in the village laugh uncontrollably. Can he reverse it?",
    authorName: "Oliver Johnson",
    ageGroup: "5-8",
    category: "humor",
    readCount: 1234,
    likeCount: 98,
    createdAt: "2024-01-01T08:00:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/dragon-garden.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "8",
    title: "Family Game Night Gone Wild",
    description:
      "What starts as a simple board game night turns into an epic adventure when the game pieces come to life.",
    authorName: "Maya Patel",
    ageGroup: "9-12",
    category: "family",
    readCount: 1654,
    likeCount: 123,
    createdAt: "2023-12-28T19:30:00Z",
    fileType: "video",
    coverImageUrl: "/stories/space-pirates.svg",
    fileUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  },
  {
    _id: "9",
    title: "The New Kid's Superpower",
    description:
      "Starting at a new school is hard, but it's even harder when you accidentally reveal you can read minds.",
    authorName: "Jordan Smith",
    ageGroup: "13-17",
    category: "school",
    readCount: 2987,
    likeCount: 234,
    createdAt: "2023-12-25T15:45:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/brave-bunny.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "10",
    title: "The Friendship Bracelet Magic",
    description:
      "Two best friends discover that their handmade bracelets have the power to grant wishes, but only when they work together.",
    authorName: "Isabella Garcia",
    ageGroup: "5-8",
    category: "friendship",
    readCount: 1432,
    likeCount: 156,
    createdAt: "2023-12-22T12:15:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/time-backpack.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    _id: "11",
    title: "Quest for the Golden Compass",
    description:
      "A group of young explorers must navigate treacherous mountains and solve ancient riddles to find a legendary treasure.",
    authorName: "Ethan Brown",
    ageGroup: "13-17",
    category: "adventure",
    readCount: 3456,
    likeCount: 278,
    createdAt: "2023-12-20T10:00:00Z",
    fileType: "video",
    coverImageUrl: "/stories/robot-friend.svg",
    fileUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  },
  {
    _id: "12",
    title: "The Singing Whale's Message",
    description:
      "A marine biologist's daughter discovers she can understand whale songs and learns about an underwater crisis.",
    authorName: "Chloe Anderson",
    ageGroup: "9-12",
    category: "animals",
    readCount: 1789,
    likeCount: 134,
    createdAt: "2023-12-18T14:30:00Z",
    fileType: "pdf",
    coverImageUrl: "/stories/dragon-garden.svg",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

export default function ExploreStories() {
  const [allStories] = useState<Story[]>(mockStories);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageGroup, setAgeGroup] = useState("all");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    pages: 1,
    total: 0,
  });

  const categories = [
    { value: "all", label: "All Categories" },
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
    { value: "all", label: "All Ages" },
    { value: "5-8", label: "5-8 years" },
    { value: "9-12", label: "9-12 years" },
    { value: "13-17", label: "13-17 years" },
  ];

  const filterStories = () => {
    let filtered = [...allStories];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(searchLower) ||
          story.description.toLowerCase().includes(searchLower) ||
          story.authorName.toLowerCase().includes(searchLower)
      );
    }

    // Apply age group filter
    if (ageGroup !== "all") {
      filtered = filtered.filter((story) => story.ageGroup === ageGroup);
    }

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter((story) => story.category === category);
    }

    // Calculate pagination
    const limit = 12;
    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStories = filtered.slice(startIndex, endIndex);

    setStories(paginatedStories);
    setPagination({
      current: currentPage,
      pages,
      total,
    });
  };

  useEffect(() => {
    filterStories();
  }, [searchTerm, ageGroup, category, currentPage, allStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-ninja text-4xl sm:text-5xl text-ninja-black mb-4">
            Explore Stories
          </h1>
          <p className="text-xl text-ninja-gray max-w-3xl">
            Discover amazing stories from our community of young writers. Filter
            by age group, category, or search for something specific!
          </p>
        </div>

        {/* Filters */}
        <div className="ninja-scroll p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-ninja-gray" />
                  <Input
                    placeholder="Search stories, authors, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            </div>

            {/* Age Group Filter */}
            <Select
              value={ageGroup}
              onValueChange={(value) => {
                setAgeGroup(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue />
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

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-ninja-gray">
            {pagination.total > 0 ? (
              <p>
                Showing {(pagination.current - 1) * 12 + 1}-
                {Math.min(pagination.current * 12, pagination.total)} of{" "}
                {pagination.total} stories
              </p>
            ) : (
              <p>No stories found matching your criteria</p>
            )}
          </div>
        )}

        {/* Stories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-ninja-gray bg-opacity-20 rounded-lg mb-2"></div>
                <div className="h-3 bg-ninja-gray bg-opacity-20 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-ninja-gray bg-opacity-15 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.current > 1) {
                          setCurrentPage(pagination.current - 1);
                        }
                      }}
                      className={
                        pagination.current === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={page === pagination.current}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.current < pagination.pages) {
                          setCurrentPage(pagination.current + 1);
                        }
                      }}
                      className={
                        pagination.current === pagination.pages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-ninja-gray bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-ninja-gray opacity-50" />
            </div>
            <h3 className="font-ninja text-2xl text-ninja-gray mb-2">
              No Stories Found
            </h3>
            <p className="text-ninja-gray opacity-80 mb-6">
              Try adjusting your search criteria or explore different
              categories.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setAgeGroup("all");
                setCategory("all");
                setCurrentPage(1);
              }}
              variant="outline"
              className="border-ninja-crimson text-ninja-crimson hover:bg-ninja-crimson hover:text-ninja-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

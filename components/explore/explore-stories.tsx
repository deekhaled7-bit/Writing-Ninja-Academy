"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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

// Removed mockStories; fetching real stories from API

function ExploreStories() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") ?? "");
  const [ageGroup, setAgeGroup] = useState<string>(searchParams.get("ageGroup") ?? "all");
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get("page") || "1", 10));
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

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "12");
      params.set("page", String(currentPage));
      if (searchTerm) params.set("search", searchTerm);
      if (ageGroup && ageGroup !== "all") params.set("ageGroup", ageGroup);
      if (category && category !== "all") params.set("category", category);

      const res = await fetch(`/api/stories?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch stories");
      const data = await res.json();
      setStories(data.stories as Story[]);
      setPagination({
        current: data.pagination.currentPage,
        pages: data.pagination.totalPages,
        total: data.pagination.totalStories,
      });
    } catch (err) {
      console.error(err);
      setStories([]);
      setPagination({ current: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, ageGroup, category, currentPage]);

  const updateQuery = (updates: Partial<{ search: string; ageGroup: string; category: string; page: number }>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search); else params.delete("search");
    }
    if (updates.ageGroup !== undefined) {
      if (updates.ageGroup && updates.ageGroup !== "all") params.set("ageGroup", updates.ageGroup); else params.delete("ageGroup");
    }
    if (updates.category !== undefined) {
      if (updates.category && updates.category !== "all") params.set("category", updates.category); else params.delete("category");
    }
    if (updates.page !== undefined) {
      if (updates.page > 1) params.set("page", String(updates.page)); else params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateQuery({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    updateQuery({ ageGroup, category, page: 1 });
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-4xl sm:text-5xl text-ninja-black mb-4">
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
                // Delay ensures state updates before filtering
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
                          const newPage = pagination.current - 1;
                          setCurrentPage(newPage);
                          updateQuery({ page: newPage });
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
                          updateQuery({ page });
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
                          const newPage = pagination.current + 1;
                          setCurrentPage(newPage);
                          updateQuery({ page: newPage });
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
            <h3 className="font-oswald text-2xl text-ninja-gray mb-2">
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

export default function ExploreStoriesWrapper() {
  return <Suspense fallback={<div>Loading...</div>}>
    <ExploreStories />
  </Suspense>
}

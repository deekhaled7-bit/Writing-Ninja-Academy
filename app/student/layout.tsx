"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, User, LogOut, Home } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Student layout - Session status:", status);
    console.log("Student layout - Session data:", session);

    if (status === "loading") {
      // Don't redirect while loading
      return;
    }

    // Add a delay before redirecting to ensure session is fully loaded
    const redirectTimer = setTimeout(() => {
      if (status === "unauthenticated") {
        console.log("Redirecting to signin - unauthenticated");
        router.replace("/signin");
      } else if (status === "authenticated") {
        if (session?.user?.role !== "student") {
          console.log("Redirecting to home - not student role");
          router.replace("/");
        } else if (!session?.user?.active) {
          console.log("Redirecting to account-status - inactive account");
          router.replace("/account-status?reason=inactive");
        } else if (!session?.user?.verified) {
          console.log("Redirecting to account-status - unverified account");
          router.replace("/account-status?reason=unverified");
        } else {
          console.log("Student authenticated successfully");
          // Only set loading to false when we confirm the user is a student with active and verified account
          setLoading(false);
        }
      }
    }, 500); // 500ms delay to ensure session is fully processed

    return () => clearTimeout(redirectTimer);
  }, [session, status, router]);

  const handleSignOut = async () => {
    try {
      // First clear the session from the database
      await fetch("/api/auth/logout");
      // Then use next-auth's signOut function
      const { signOut } = await import("next-auth/react");
      signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/signin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center  justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-64 w-16 bg-white shadow-md px-2  lg:px-8 py-2 lg:py-8 flex flex-col">
        <div className="mb-8 mt-4">
          <h1 className="text-xl font-bold text-ninja-crimson lg:block hidden">
            Student Dashboard
          </h1>
          <p className="text-sm text-gray-500 lg:block hidden">
            Welcome, {session?.user?.firstName || "Student"}
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            href="/student"
            className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100"
          >
            <Home className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Dashboard</span>
          </Link>
          <Link
            href="/student/my-stories"
            className="flex items-center  p-2 justify-center rounded-md hover:bg-gray-100"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">My Stories</span>
          </Link>
          <Link
            href="/student/write"
            className="flex items-center  p-2 justify-center rounded-md hover:bg-gray-100"
          >
            <PenTool className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Write Story</span>
          </Link>
          <Link
            href="/student/profile"
            className="flex items-center  p-2 justify-center rounded-md hover:bg-gray-100"
          >
            <User className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">My Profile</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Student Portal</h2>
            <p className="text-sm text-gray-500">
              Create and manage your stories
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

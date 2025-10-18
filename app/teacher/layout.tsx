"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  Award,
} from "lucide-react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Teacher layout - Session status:", status);
    console.log("Teacher layout - Session data:", session);

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
        if (session?.user?.role !== "teacher") {
          console.log("Redirecting to home - not teacher role");
          router.replace("/");
        } else if (!session?.user?.active) {
          console.log("Redirecting to account-status - inactive account");
          router.replace("/account-status?reason=inactive");
        } else if (!session?.user?.verified) {
          console.log("Redirecting to account-status - unverified account");
          router.replace("/account-status?reason=unverified");
        } else {
          console.log("Teacher authenticated successfully");
          // Only set loading to false when we confirm the user is a teacher with active and verified account
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ninja-dark">
      {/* Sidebar */}
      <div className="lg:w-64 w-16 bg-ninja-cream shadow-lg px-2 lg:px-8 py-2 lg:py-8 flex flex-col">
        {/* <div className="mb-8 mt-4">
          <p className="text-sm text-ninja-black lg:block hidden">
            Welcome, {session?.user?.firstName || "Teacher"}
          </p>
        </div> */}

        <nav className="flex-1 space-y-2">
          <Link
            href="/teacher"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname === "/teacher"
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-black"
            }`}
          >
            <Home className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Dashboard</span>
          </Link>
          <Link
            href="/teacher/classes"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/classes")
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-black"
            }`}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Classes</span>
          </Link>
          <Link
            href="/teacher/stories"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/stories")
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-black"
            }`}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Stories</span>
          </Link>
          {/* <Link
            href="/teacher/students"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/students")
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-b"
            }`}
          >
            <Users className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Students</span>
          </Link> */}
          
          <Link
            href="/teacher/quizzes"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/quizzes")
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-black"
            }`}
          >
            <Award className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Quizzes</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-ninja-white/20">
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
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  BookMarked,
  LogOut,
  Home,
  GraduationCap,
  Award,
  Bell,
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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      if (session?.user?.id && !loading) {
        try {
          const response = await fetch(
            `/api/notifications?userId=${session.user.id}`
          );
          if (response.ok) {
            const notifications = await response.json();
            // Check if there are any unread notifications
            const unreadExists = notifications.some(
              (notification: any) => !notification.read
            );
            setHasUnreadNotifications(unreadExists);
          }
        } catch (error) {
          console.error("Error checking unread notifications:", error);
        }
      }
    };

    if (session?.user?.id && !loading) {
      checkUnreadNotifications();
      // Set up interval to check for new notifications every minute
      const interval = setInterval(checkUnreadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session, loading]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ninja-dark">
      {/* Sidebar - Hidden on small screens */}
      <div className="hidden md:flex lg:w-64 w-16 bg-ninja-cream shadow-lg px-2 lg:px-8 py-2 lg:py-8 flex-col">
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
          <Link
            href="/teacher/book-assignments"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/book-assignments")
                ? "bg-ninja-crimson text-ninja-white"
                : "text-ninja-black"
            }`}
          >
            <BookMarked className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Book Assignments</span>
          </Link>
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
          <Link
            href="/teacher/notifications"
            className={`flex items-center p-2 justify-center rounded-md hover:bg-ninja-crimson hover:text-ninja-white ${
              pathname.startsWith("/teacher/notifications")
                ? "bg-ninja-crimson text-ninja-white"
                : ""
            } relative`}
          >
            <div className="relative flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              <span className="lg:inline hidden">Notifications</span>
              {hasUnreadNotifications && (
                <span className="absolute top-0 left-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 sm:p-4 md:p-8">{children}</div>
    </div>
  );
}

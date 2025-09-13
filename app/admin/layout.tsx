"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  School,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

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
        if (session?.user?.role !== "admin") {
          console.log("Redirecting to home - not admin role");
          router.replace("/");
        } else if (!session?.user?.active) {
          console.log("Redirecting to account-status - inactive account");
          router.replace("/account-status?reason=inactive");
        } else if (!session?.user?.verified) {
          console.log("Redirecting to account-status - unverified account");
          router.replace("/account-status?reason=unverified");
        } else {
          console.log("Admin authenticated successfully");
          // Only set loading to false when we confirm the user is an admin with active and verified account
          setLoading(false);
        }
      }
    }, 500); // 500ms delay to ensure session is fully processed

    return () => clearTimeout(redirectTimer);
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-64 w-16 bg-white shadow-md px-2  lg:px-8 py-2 lg:py-8 flex flex-col">
        {/* <div className="mb-8 mt-4">
          <h1 className="text-xl font-bold text-ninja-crimson lg:block hidden">
            Admin Dashboard
          </h1>
        </div> */}
        <nav className="flex-1 justify-start space-y-2">
          <Link
            href="/admin"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <Users className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Users</span>
          </Link>
          <Link
            href="/admin/grades"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Grades</span>
          </Link>
          <Link
            href="/admin/classes"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <School className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Classes</span>
          </Link>
          <Link
            href="/admin/stories"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Stories</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center p-2  justify-start rounded-md hover:bg-gray-100"
          >
            <Settings className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Settings</span>
          </Link>
        </nav>
        <div className="mt-auto pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              // Clear the session from the database before signing out
              fetch("/api/auth/logout", { method: "GET" })
                .then(() => signOut({ callbackUrl: "/signin" }))
                .catch((error) => console.error("Logout error:", error));
            }}
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span className="lg:inline hidden">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* <div className="mb-6">
            <h2 className="text-xl font-semibold">Admin Portal</h2>
            <p className="text-sm text-gray-500">
              Manage users, grades, classes and stories
            </p>
          </div> */}
          {children}
        </div>
      </div>
    </div>
  );
}

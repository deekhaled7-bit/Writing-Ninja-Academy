"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Sword,
  User,
  BookOpen,
  PlusCircle,
  LogOut,
  GraduationCap,
  Award,
  Bell,
  Gauge,
  Users,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasUnreadAdminNotifications, setHasUnreadAdminNotifications] =
    useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  // Check for unread notifications
  useEffect(() => {
    if (session?.user) {
      const checkUnreadNotifications = async () => {
        try {
          const response = await fetch(
            `/api/notifications?userId=${session.user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            const unreadNotifications = data.filter(
              (notification: any) => !notification.read
            );
            setHasUnreadNotifications(unreadNotifications.length > 0);

            // Update the navbar notification indicator
            const indicator = document.getElementById(
              "navbar-notification-indicator"
            );
            if (indicator) {
              indicator.classList.toggle(
                "hidden",
                unreadNotifications.length === 0
              );
            }
          }
        } catch (error) {
          console.error("Error checking notifications:", error);
        }
      };

      checkUnreadNotifications();

      // Check for new notifications every minute
      const interval = setInterval(checkUnreadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Check for unread admin notifications (readByAdmin: false)
  useEffect(() => {
    if (session?.user?.role === "admin") {
      const checkUnreadAdminNotifications = async () => {
        try {
          const response = await fetch(`/api/admin/notifications/unread-count`);
          if (response.ok) {
            const data = await response.json();
            setHasUnreadAdminNotifications((data?.count || 0) > 0);
          }
        } catch (error) {
          console.error("Error checking admin notifications:", error);
        }
      };

      checkUnreadAdminNotifications();

      // Check for new admin notifications every minute
      const interval = setInterval(checkUnreadAdminNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        menuButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/explore", label: "Explore Stories", icon: BookOpen },
    { href: "/about", label: "About" },
    { href: "/#howItWorks", label: "How It Works" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-ninja-crimson font-oswald border-b border-ninja-coral/30 sticky top-0 z-50">
      <div className=" px-2  lg:px-8">
        <div className="flex justify-between items-center h-20 ">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            {/* <Sword className="h-12 w-12 text-ninja-crimson" /> */}
            <Image src="/dee/twoChar.png" alt="logo" width={70} height={70} />
            <span className="hidden md:block font-oswald text-2xl text-ninja-white">
              The Writing Ninjas Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex text-base lg:text-lg items-center space-x-2 md:space-x-4 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ninja-white hover:text-ninja-gold transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === "authenticated" && session?.user ? (
              <>
                {session.user?.role !== "student" && (
                  <Link href="/upload">
                    <Button className="bg-ninja-coral hover:bg-ninja-crimson text-ninja-white">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload Story
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-12 w-12 rounded-full"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          className="bg-ninja-white"
                          src={session.user?.profilePicture || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback className="bg-ninja-peach text-ninja-black">
                          {session.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {session.user?.role || "User"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link
                      href={
                        session.user?.role === "admin"
                          ? "/admin"
                          : session.user?.role === "teacher"
                          ? "/teacher"
                          : "/student"
                      }
                    >
                      <DropdownMenuItem>
                        <Gauge className="mr-2 h-4 w-4" />
                        {session.user?.role === "admin"
                          ? "Admin Dashboard"
                          : session.user?.role === "teacher"
                          ? "Teacher Dashboard"
                          : "Student Dashboard"}
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={
                        session.user?.role === "admin"
                          ? "/admin/stories"
                          : session.user?.role === "teacher"
                          ? "/teacher/stories"
                          : "/student/my-stories"
                      }
                    >
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        {session.user?.role === "admin" ||
                        session.user?.role === "teacher"
                          ? "Stories"
                          : "My Stories"}{" "}
                      </DropdownMenuItem>
                    </Link>

                    {/* Admin quick links */}
                    {session.user?.role === "admin" && (
                      <>
                        <Link
                          href="/admin/notifications"
                          className=""
                          onClick={async () => {
                            try {
                              await fetch(
                                "/api/admin/notifications/mark-read",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                }
                              );
                              setHasUnreadAdminNotifications(false);
                            } catch (error) {
                              console.error(
                                "Error marking admin notifications as read:",
                                error
                              );
                            }
                          }}
                        >
                          <DropdownMenuItem>
                            <div className="relative flex items-center">
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                              {hasUnreadAdminNotifications && (
                                <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/admin/users">
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Users
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/admin/grades">
                          <DropdownMenuItem>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Grades
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/admin/classes">
                          <DropdownMenuItem>
                            <School className="mr-2 h-4 w-4" />
                            Classes
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    {/* Teacher quick links */}

                    {session.user?.role === "teacher" && (
                      <>
                        <Link
                          href="/teacher/notifications"
                          className=""
                          onClick={async () => {
                            try {
                              await fetch("/api/notifications/mark-read", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              });
                              setHasUnreadNotifications(false);
                            } catch (error) {
                              console.error(
                                "Error marking notifications as read:",
                                error
                              );
                            }
                          }}
                        >
                          <DropdownMenuItem>
                            <div className="relative flex items-center">
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                              {hasUnreadNotifications && (
                                <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/teacher/profile">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/teacher/classes">
                          <DropdownMenuItem>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Classes
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/teacher/quizzes">
                          <DropdownMenuItem>
                            <Award className="mr-2 h-4 w-4" />
                            Quizzes
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}

                    {/* Student quick links for small screens */}
                    {session.user?.role === "student" && (
                      <>
                        <DropdownMenuSeparator className="md:hidden" />
                        <Link href="/student" className="md:hidden">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/student/my-stories" className="md:hidden">
                          <DropdownMenuItem>
                            <BookOpen className="mr-2 h-4 w-4" />
                            My Stories
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/student/profile" className="">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                          </DropdownMenuItem>
                        </Link>
                        <Link
                          href="/student/notifications"
                          className=""
                          onClick={async () => {
                            try {
                              await fetch("/api/notifications/mark-read", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                              });
                              setHasUnreadNotifications(false);
                            } catch (error) {
                              console.error(
                                "Error marking notifications as read:",
                                error
                              );
                            }
                          }}
                        >
                          <DropdownMenuItem>
                            <div className="relative flex items-center">
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                              {hasUnreadNotifications && (
                                <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        </Link>
                        {/* <Link href="/student/notifications" className="">
                          <DropdownMenuItem>
                            <div className="relative flex items-center">
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                              {hasUnreadNotifications && (
                                <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        </Link> */}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="text-ninja-black hover:text-ninja-peach"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="space-x-2">
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    className="text-ninja-white hover:bg-none hover:text-ninja-gold"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost" className="text-ninja-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            {status === "authenticated" && session?.user.role !== "admin" && (
              <Link
                href={`/${session.user.role}/notifications`}
                className="mr-2"
                onClick={async () => {
                  try {
                    await fetch("/api/notifications/mark-read", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    setHasUnreadNotifications(false);
                  } catch (error) {
                    console.error(
                      "Error marking notifications as read:",
                      error
                    );
                  }
                }}
              >
                <div className="relative">
                  <Bell className="h-5 w-5 text-ninja-white" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-ninja-white" />
                  )}
                </div>
              </Link>
            )}
            {status === "authenticated" && session?.user.role === "admin" && (
              <Link
                href={`/admin/notifications`}
                className="mr-2"
                onClick={async () => {
                  try {
                    await fetch("/api/admin/notifications/mark-read", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    setHasUnreadAdminNotifications(false);
                  } catch (error) {
                    console.error(
                      "Error marking admin notifications as read:",
                      error
                    );
                  }
                }}
              >
                <div className="relative">
                  <Bell className="h-5 w-5 text-ninja-white" />
                  {hasUnreadAdminNotifications && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-ninja-white" />
                  )}
                </div>
              </Link>
            )}
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-ninja-white hover:text-ninja-gold"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="lg:hidden fixed left-0 top-[66px] z-30 border-t bg-ninja-crimson w-[100vw] border-ninja-coral/30"
          >
            <div className="pl-4 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-ninja-white hover:text-ninja-gold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {status === "authenticated" && session?.user ? (
                <>
                  {session.user?.role !== "student" && (
                    <Link
                      href="/upload"
                      className="block  py-2 text-ninja-white hover:text-ninja-peach font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Upload Story
                    </Link>
                  )}
                  <Link
                    href={
                      session.user?.role === "admin"
                        ? "/admin"
                        : session.user?.role === "teacher"
                        ? "/teacher"
                        : "/student"
                    }
                    className="block  py-2 text-ninja-white hover:text-ninja-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {session.user?.role === "admin"
                      ? "Admin Dashboard"
                      : session.user?.role === "teacher"
                      ? "Teacher Dashboard"
                      : "Student Dashboard"}
                  </Link>

                  {/* Student mobile links */}
                  {session.user?.role === "student" && (
                    <>
                      <Link
                        href="/student/profile"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">My Profile</div>
                      </Link>
                      {/* <Link
                        href="/student/notifications"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="relative flex items-center">
                          Notifications
                          {hasUnreadNotifications && (
                            <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      </Link> */}
                    </>
                  )}

                  {/* Admin mobile links */}
                  {session.user?.role === "admin" && (
                    <>
                      <Link
                        href="/admin/users"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {/* <Users className="mr-2 h-4 w-4" /> */}
                          Users
                        </div>
                      </Link>
                      <Link
                        href="/admin/grades"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {/* <GraduationCap className="mr-2 h-4 w-4" /> */}
                          Grades
                        </div>
                      </Link>
                      <Link
                        href="/admin/classes"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {/* <School className="mr-2 h-4 w-4" /> */}
                          Classes
                        </div>
                      </Link>
                      <Link
                        href="/admin/stories"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {/* <BookOpen className="mr-2 h-4 w-4" /> */}
                          Stories
                        </div>
                      </Link>
                    </>
                  )}

                  {/* Teacher mobile links */}
                  {session.user?.role === "teacher" && (
                    <>
                      <Link
                        href="/teacher/profile"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/teacher/classes"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Classes
                      </Link>
                      <Link
                        href="/teacher/stories"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Stories
                      </Link>
                      <Link
                        href="/teacher/quizzes"
                        className="block py-2 text-ninja-white hover:text-ninja-gold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quizzes
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/signin" });
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left  py-2 text-ninja-black hover:text-ninja-peach"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block  py-2 text-ninja-white hover:bg-none hover:text-ninja-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block  py-2 text-ninja-white hover:text-ninja-gold font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

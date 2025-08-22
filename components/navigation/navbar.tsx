"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Menu, X, Sword, User, BookOpen, PlusCircle } from "lucide-react";
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
  // For demo purposes, we'll show as if user is logged in
  const demoUser = {
    name: "Demo User",
    ninjaLevel: 1,
    ninjaGold: 100,
  };

  const navLinks = [
    { href: "/explore", label: "Explore Stories", icon: BookOpen },
    { href: "/about", label: "About" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-ninja-black font-ninja border-b border-ninja-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 ">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            {/* <Sword className="h-8 w-8 text-ninja-crimson" /> */}
            <Image src="/logo/logoRed.png" alt="logo" width={64} height={64} />
            <span className="hidden md:block font-ninja text-2xl text-ninja-white">
              The Writing Ninja Academy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex text-lg items-center space-x-8">
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
          <div className="hidden md:flex items-center space-x-4">
            {false ? (
              <>
                <Link href="/upload">
                  <Button className="bg-ninja-crimson hover:bg-red-600 text-ninja-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Upload Story
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        {/* <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        /> */}
                        <AvatarFallback className="bg-ninja-gold text-ninja-black">
                          {/* {session.user?.name?.[0] || "U"} */}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {/* <p className="font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Level {session.user?.ninjaLevel || 1} •{" "}
                          {session.user?.ninjaGold || 0} Gold
                        </p> */}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-stories">
                      <DropdownMenuItem>
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Stories
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="space-x-2">
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="text-ninja-white hover:text-ninja-gold"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-ninja-crimson hover:bg-red-600 text-ninja-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
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
          <div className="md:hidden fixed left-0 top-[66px] z-30 border-t bg-ninja-black w-[100vw] border-ninja-gray">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-ninja-white hover:text-ninja-gold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* {session ? ( */}
              {false ? (
                <>
                  <Link
                    href="/upload"
                    className="block px-3 py-2 text-ninja-crimson hover:text-red-400 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upload Story
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-ninja-white hover:text-ninja-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {/* <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300"
                  >
                    Sign Out
                  </button> */}
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-ninja-white hover:text-ninja-gold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-ninja-crimson hover:text-red-400 font-medium"
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

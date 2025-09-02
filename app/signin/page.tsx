"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to home or dashboard
        window.location.href = "/";
      } else {
        alert(data.error || "Sign in failed");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ninja-coral to-ninja-orange flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex justify-center"
        >
          <Image
            src="/logo/logo1.png"
            alt="Ninja Bolt Logo"
            width={400}
            height={400}
            className="drop-shadow-2xl"
          />
        </motion.div>

        {/* Sign In Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <div className="lg:hidden mb-4">
                <Image
                  src="/logo/logo1.png"
                  alt="Ninja Bolt Logo"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-dark">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-ninja-gray">
                Sign in to your Ninja Bolt account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-ninja-dark font-oswald"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="font-oswald"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-ninja-dark font-oswald"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="font-oswald"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-ninja-coral hover:bg-ninja-orange text-white font-oswald"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-ninja-gray font-oswald">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-ninja-coral hover:text-ninja-orange font-bold"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

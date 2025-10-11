"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Signing in with credentials:", { email });
      // Use NextAuth's signIn method directly
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin", // Set a default callback URL
      });

      console.log("Sign in result:", result);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error || "Sign in failed",
          variant: "destructive",
        });
      } else {
        // Fetch the session to get the user's role
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        console.log("Auth check response:", data);

        if (data.isAuth && data.user) {
          // Check if account is active and verified
          if (!data.user.active) {
            console.log("Account is inactive, redirecting to account-status");
            window.location.href = "/account-status?reason=inactive";
            return;
          }

          if (!data.user.verified) {
            console.log("Account is unverified, redirecting to account-status");
            window.location.href = "/account-status?reason=unverified";
            return;
          }

          // Redirect based on role
          switch (data.user.role) {
            case "admin":
              console.log("Redirecting to admin dashboard");
              window.location.href = "/admin";
              break;
            case "teacher":
              console.log("Redirecting to teacher dashboard");
              window.location.href = "/teacher";
              break;
            case "student":
              console.log("Redirecting to student dashboard");
              window.location.href = "/student";
              break;
            default:
              console.log("Unknown role, redirecting to homepage");
              window.location.href = "/";
          }
        } else {
          console.log("No auth data, redirecting to homepage");
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
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
            src="/dee/twoChar.png"
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
              <div className="lg:hidden md:mb-4 flex justify-center w-full">
                <Image
                  src="/dee/twoChar.png"
                  alt="signIn"
                  width={300}
                  height={300}
                  className=""
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-gray">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-ninja-gray">
                Sign in to your Ninjas account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-ninja-gray font-oswald"
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
                    className="text-ninja-gray font-oswald"
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

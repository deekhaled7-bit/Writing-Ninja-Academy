"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to home or show success message
        alert(data.message || "Account created successfully!");
        window.location.href = "/";
      } else {
        alert(data.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ninja-orange to-ninja-coral flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <div className="lg:hidden mb-4">
                <Image
                  src="/dee/16.png"
                  alt="Ninja Character"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-dark">
                Join Ninja Bolt
              </CardTitle>
              <CardDescription className="text-ninja-gray">
                Create your account to start your ninja journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-ninja-dark font-oswald">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="font-oswald"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-ninja-dark font-oswald">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="font-oswald"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-ninja-dark font-oswald">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="font-oswald"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-ninja-dark font-oswald">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="font-oswald"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-ninja-orange hover:bg-ninja-coral text-white font-oswald"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-ninja-gray font-oswald">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-ninja-orange hover:text-ninja-coral font-bold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex justify-center"
        >
          <Image
            src="/dee/16.png"
            alt="Ninja Character"
            width={400}
            height={400}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </div>
  );
}
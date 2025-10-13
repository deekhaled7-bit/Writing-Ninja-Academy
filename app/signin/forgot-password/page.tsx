"use client";
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for a reset link.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Error sending reset email.");
    } finally {
      setLoading(false);
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

        {/* Forgot Password Form */}
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
                  alt="Forgot Password"
                  width={300}
                  height={300}
                  className=""
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-gray">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-ninja-gray">
                Enter your email to receive a password reset link
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
                <Button
                  type="submit"
                  className="w-full bg-ninja-coral hover:bg-ninja-orange text-white font-oswald"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                {message && (
                  <p className="mt-2 text-center text-ninja-coral font-oswald">
                    {message}
                  </p>
                )}
                <div className="mt-4 text-center">
                  <Link
                    href="/signin"
                    className="text-ninja-coral hover:text-ninja-orange font-oswald"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

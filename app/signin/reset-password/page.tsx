"use client";
import React, { useState, useEffect, Suspense } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!token) return setMessage("Invalid or missing token.");
    axios
      .get(`/api/auth/reset-password?token=${token}`)
      .then((res) => {
        setValid(res.data.success);
      })
      .catch(() => {
        setMessage("Token invalid or expired.");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });
      toast.success(res.data.message || "Password reset successful.");
      if (res.data.success) {
        setTimeout(() => router.push("/signin"), 2000);
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Error resetting password.");
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

        {/* Reset Password Form */}
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
                  alt="Reset Password"
                  width={300}
                  height={300}
                  className=""
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-gray">
                Reset Password
              </CardTitle>
              <CardDescription className="text-ninja-gray">
                {valid ? "Enter your new password" : "Password Reset"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {valid ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-ninja-gray font-oswald"
                    >
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="font-oswald"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-ninja-gray font-oswald"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="font-oswald"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-ninja-coral hover:bg-ninja-orange text-white font-oswald"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                  {message && (
                    <p className="mt-2 text-center text-ninja-coral font-oswald">
                      {message}
                    </p>
                  )}
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-ninja-coral mb-4 font-oswald">
                    {message || "Token invalid or expired."}
                  </p>
                  <Link
                    href="/signin/forgot-password"
                    className="bg-ninja-coral hover:bg-ninja-orange text-white font-oswald px-4 py-2 rounded-md"
                  >
                    Request New Reset Link
                  </Link>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link
                  href="/signin"
                  className="text-ninja-coral hover:text-ninja-orange font-oswald"
                >
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-ninja-coral to-ninja-orange">
          <div className="bg-white/95 p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-oswald text-ninja-gray mb-4">Reset Password</h1>
            <p className="text-ninja-gray">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;

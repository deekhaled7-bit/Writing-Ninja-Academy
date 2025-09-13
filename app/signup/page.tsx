"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    gradeId: "",
    classId: "",
  });
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch grades for student registration
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoadingGrades(true);
        const response = await fetch("/api/grades");
        if (response.ok) {
          const data = await response.json();
          setGrades(data.grades || []);
        } else {
          console.error("Failed to fetch grades");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, []);

  // Fetch classes based on selected grade
  useEffect(() => {
    const fetchClasses = async () => {
      if (!formData.gradeId) {
        setClasses([]);
        return;
      }

      try {
        setLoadingClasses(true);
        const response = await fetch(
          `/api/classes?gradeId=${formData.gradeId}`
        );
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
          // Reset classId when grade changes
          setFormData((prev) => ({ ...prev, classId: "" }));
        } else {
          console.error("Failed to fetch classes");
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [formData.gradeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }

    // Validate grade selection for students
    if (formData.role === "student" && !formData.gradeId) {
      toast.error("Please select a grade");
      setIsLoading(false);
      return;
    }

    // Validate class selection for students
    if (formData.role === "student" && !formData.classId) {
      toast.error("Please select a class");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          classId: formData.classId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to role-specific dashboard
        toast.success(data.message || "Account created successfully!");
        const { user } = data;
        if (user && user.role) {
          switch (user.role) {
            case "admin":
              window.location.href = "/admin";
              break;
            case "teacher":
              window.location.href = "/teacher";
              break;
            case "student":
              window.location.href = "/student";
              break;
            default:
              window.location.href = "/";
          }
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(data.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-ninja-coral flex items-center justify-center ">
      <div className="w-full max-lg:p-4 justify-center grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Sign Up Form */}
        <motion.div
          className="lg:col-span-2 w-full col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="w-full  bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <div className="lg:hidden mb-4">
                <Image
                  src="/dee/16.png"
                  alt="Ninja Character"
                  width={300}
                  height={300}
                  className="mx-auto"
                />
              </div>
              <CardTitle className="text-2xl font-oswald text-ninja-dark">
                Join The Writing Ninjas Academy
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
                  <Label
                    htmlFor="email"
                    className="text-ninja-dark font-oswald"
                  >
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
                  <Label
                    htmlFor="password"
                    className="text-ninja-dark font-oswald"
                  >
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
                  <Label
                    htmlFor="confirmPassword"
                    className="text-ninja-dark font-oswald"
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-ninja-dark font-oswald">
                    Account Type
                  </Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md font-oswald focus:outline-none focus:ring-2 focus:ring-ninja-orange"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="gradeId"
                      className="text-ninja-dark font-oswald"
                    >
                      Select Grade
                    </Label>
                    <select
                      id="gradeId"
                      name="gradeId"
                      value={formData.gradeId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md font-oswald focus:outline-none focus:ring-2 focus:ring-ninja-orange"
                      required={formData.role === "student"}
                      disabled={loadingGrades}
                    >
                      <option value="">Select a grade</option>
                      {grades.map((grade: any) => (
                        <option key={grade._id} value={grade._id}>
                          Grade {grade.gradeNumber} - {grade.name}
                        </option>
                      ))}
                    </select>
                    {loadingGrades && (
                      <p className="text-sm text-ninja-gray">
                        Loading grades...
                      </p>
                    )}
                  </div>

                  {formData.gradeId && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="classId"
                        className="text-ninja-dark font-oswald"
                      >
                        Select Class
                      </Label>
                      <select
                        id="classId"
                        name="classId"
                        value={formData.classId}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md font-oswald focus:outline-none focus:ring-2 focus:ring-ninja-orange"
                        required={formData.role === "student"}
                        disabled={loadingClasses}
                      >
                        <option value="">Select a class</option>
                        {classes.map((classItem: any) => (
                          <option key={classItem._id} value={classItem._id}>
                            {classItem.className}
                          </option>
                        ))}
                      </select>
                      {loadingClasses && (
                        <p className="text-sm text-ninja-gray">
                          Loading classes...
                        </p>
                      )}
                      {!loadingClasses && classes.length === 0 && (
                        <p className="text-sm text-ninja-gray">
                          No classes available for this grade
                        </p>
                      )}
                    </div>
                  )}
                </>

                <Button
                  type="submit"
                  className="w-full bg-ninja-crimson hover:bg-ninja-coral text-white font-oswald"
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
                    className="text-ninja-orange underline hover:text-ninja-coral font-bold"
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

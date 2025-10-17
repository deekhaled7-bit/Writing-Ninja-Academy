"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Award,
  BookMarked,
  Calendar,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

type DashboardStats = {
  totalStudents: number;
  totalStories: number;
  pendingReviews: number;
};

type Class = {
  _id: string;
  className: string;
};

type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  email: string;
};

type Story = {
  _id: string;
  title: string;
  coverImage: string;
};

type BookAssignment = {
  _id: string;
  title: string;
  studentId: Student | null;
  storyId: Story;
  assignedDate: string;
  // dueDate: string | null;
  isCompleted: boolean;
  readingProgress: number;
  // New properties for grouped assignments
  isGrouped?: boolean;
  studentCount?: number;
  students?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    readingProgress?: number;
    isCompleted?: boolean;
  } | null>;
  expanded?: boolean;
};

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStories: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [assignments, setAssignments] = useState<BookAssignment[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedStory, setSelectedStory] = useState<string>("");
  // const [dueDate, setDueDate] = useState<string>("");
  const [assignmentTitle, setAssignmentTitle] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/teacher/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch teacher stats");
          // Fallback to default values
          setStats({
            totalStudents: 0,
            totalStories: 0,
            pendingReviews: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching teacher stats:", error);
        // Fallback to default values
        setStats({
          totalStudents: 0,
          totalStories: 0,
          pendingReviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchClasses();
    fetchStories();
    fetchAssignments();
  }, []);

  // Fetch classes taught by the teacher
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes/");
      if (response.ok) {
        const data = await response.json();
        console.log(data.classes);
        // console.log("frontend classes" + JSON.stringify(data.classes));
        setClasses(data.classes);
        if (data.classes.length > 0) {
          setSelectedClass(data.classes[0]._id);
          fetchStudents(data.classes[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Fetch students in a class
  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/teacher/students?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch available stories
  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories");
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  // Delete assignment by title and storyId
  const handleDeleteAssignment = async (title: string, storyId: string) => {
    if (
      confirm(`Are you sure you want to delete all assignments for "${title}"?`)
    ) {
      try {
        const response = await fetch("/api/teacher/assign-book", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, storyId }),
        });

        if (response.ok) {
          // Refresh assignments after deletion
          fetchAssignments();
        } else {
          console.error("Failed to delete assignments");
        }
      } catch (error) {
        console.error("Error deleting assignments:", error);
      }
    }
  };

  // Fetch book assignments
  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/teacher/assign-book");
      if (response.ok) {
        const data = await response.json();

        // Group assignments by title and storyId
        // Create a dictionary to group assignments
        const groupedByTitle: Record<string, any> = {};

        data.assignments.forEach((assignment: BookAssignment) => {
          const key = `${assignment.title}-${assignment.storyId._id}`;

          if (!groupedByTitle[key]) {
            // Create a new object instead of using spread to avoid type issues
            groupedByTitle[key] = {
              _id: assignment._id,
              title: assignment.title,
              studentId: assignment.studentId,
              storyId: assignment.storyId,
              assignedDate: assignment.assignedDate,
              // dueDate: assignment.dueDate,
              isCompleted: assignment.isCompleted,
              readingProgress: assignment.readingProgress,
              isGrouped: false,
              studentCount: 0,
              students: [],
              expanded: false,
            };
          }

          // Count assignments with the same title
          groupedByTitle[key].studentCount++;

          // Add student to the students array with reading progress data
          if (assignment.studentId) {
            groupedByTitle[key].students.push({
              _id: assignment.studentId._id,
              firstName: assignment.studentId.firstName,
              lastName: assignment.studentId.lastName,
              profilePicture: assignment.studentId.profilePicture,
              readingProgress: assignment.readingProgress,
              isCompleted: assignment.isCompleted,
            });
          }
        });

        // Convert to array and mark as grouped if more than one student
        const processedAssignments = Object.values(groupedByTitle).map(
          (group) => {
            return {
              _id: group._id,
              title: group.title,
              studentId: group.studentId,
              storyId: group.storyId,
              assignedDate: group.assignedDate,
              // dueDate: group.dueDate,
              isCompleted: group.isCompleted,
              readingProgress: group.readingProgress,
              studentCount: group.studentCount,
              students: group.students,
              isGrouped: group.studentCount > 1,
              expanded: false,
            };
          }
        );

        setAssignments(processedAssignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Handle class change
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    fetchStudents(classId);
  };

  // Handle assignment submission
  const handleAssignBook = async () => {
    if (!selectedClass || !selectedStory || !assignmentTitle) {
      toast.error("Please fill in all required fields");
      return;
    }

    setAssignmentLoading(true);
    try {
      const response = await fetch("/api/teacher/assign-book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: selectedClass,
          studentId: selectedStudent === "all" ? null : selectedStudent,
          storyId: selectedStory,
          title: assignmentTitle,
          // dueDate: dueDate || null,
        }),
      });

      if (response.ok) {
        toast.success("Book assigned successfully");
        setDialogOpen(false);
        fetchAssignments();
        // Reset form
        setSelectedStudent("all");
        setSelectedStory("");
        // setDueDate("");
        setAssignmentTitle("");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to assign book");
      }
    } catch (error) {
      console.error("Error assigning book:", error);
      toast.error("An error occurred while assigning the book");
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="bg-ninja-cream p-4">
      <h1 className="text-2xl font-bold mb-6 text-ninja-black">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-ninja-white">
              Students under your guidance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookOpen className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStories}</div>
            <p className="text-xs text-ninja-white">
              Stories created by your students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Award className="h-4 w-4 text-ninja-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-ninja-white">
              Stories waiting for your review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Book Assignments Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Book Assignments
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-ninja-peach/90 hover:bg-ninja-peach/60">
                Assign New Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Book to Students</DialogTitle>
                <DialogDescription>
                  Assign a book to a specific student or the entire class.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class" className="text-right">
                    Class
                  </Label>
                  <Select
                    value={selectedClass}
                    onValueChange={handleClassChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.className}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-classes" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student" className="text-right">
                    Student
                  </Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Entire Class</SelectItem>
                      {students && students.length > 0 ? (
                        students.map((student) => (
                          <SelectItem
                            className="text-ninja-black"
                            key={student._id}
                            value={student._id}
                          >
                            {student.firstName + " " + student.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-students" disabled>
                          No students available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="story" className="text-right">
                    Book/Story
                  </Label>
                  <Select
                    value={selectedStory}
                    onValueChange={setSelectedStory}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select book" />
                    </SelectTrigger>
                    <SelectContent>
                      {stories.map((story) => (
                        <SelectItem key={story._id} value={story._id}>
                          {story.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Assignment Title
                  </Label>
                  <Input
                    id="title"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Week 3 Reading"
                  />
                </div>
                {/* <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date (Optional)
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="col-span-3"
                  />
                </div> */}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAssignBook}
                  disabled={assignmentLoading}
                  className="bg-ninja-crimson hover:bg-ninja-crimson/90"
                >
                  {assignmentLoading ? "Assigning..." : "Assign Book"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            {/* <TabsList className="mb-4">
              <TabsTrigger value="active">Active Assignments</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList> */}
            <TabsContent value="active">
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <BookMarked className="h-12 w-12 mx-auto text-ninja-crimson opacity-50" />
                  <p className="mt-4 text-ninja-black">
                    No active book assignments. Assign a book to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments
                    .filter((assignment) => !assignment.isCompleted)
                    .map((assignment) => (
                      <div
                        key={assignment._id}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-ninja-black">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Book: {assignment.storyId.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {assignment.isGrouped ? (
                                <button
                                  onClick={() => {
                                    // Toggle the expanded state directly in the assignments array
                                    setAssignments((prevAssignments) =>
                                      prevAssignments.map((a) =>
                                        a._id === assignment._id
                                          ? { ...a, expanded: !a.expanded }
                                          : a
                                      )
                                    );
                                  }}
                                  className="text-ninja-crimson hover:underline focus:outline-none"
                                >
                                  Assigned to: {assignment.studentCount}{" "}
                                  students {assignment.expanded ? "▲" : "▼"}
                                </button>
                              ) : (
                                <>
                                  Assigned to:{" "}
                                  {assignment.studentId
                                    ? assignment.studentId.firstName +
                                      " " +
                                      assignment.studentId.lastName
                                    : "Entire Class"}
                                </>
                              )}
                            </p>
                            <div className="mt-2 text-ninja-black flex items-center space-x-2">
                              <Calendar className="h-3 w-3 text-ninja-crimson" />
                              <span className="text-xs text-ninja-black">
                                Assigned:{" "}
                                {new Date(
                                  assignment.assignedDate
                                ).toLocaleDateString()}
                              </span>
                              {/* {assignment.dueDate && (
                                <>
                                  <span className="text-xs">•</span>
                                  <span className="text-xs text-ninja-black">
                                    Due:{" "}
                                    {new Date(
                                      assignment.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                </>
                              )} */}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleDeleteAssignment(
                                  assignment.title,
                                  assignment.storyId._id
                                )
                              }
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                              aria-label="Delete assignment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Student list when expanded */}
                        {assignment.expanded && assignment.isGrouped && (
                          <div className="mt-4 border-t pt-3">
                            <h4 className="text-sm text-ninja-black font-medium mb-2">
                              Assigned Students:
                            </h4>
                            <div className="space-y-2 max-h-60 text-ninja-black overflow-y-auto">
                              {assignment.students?.map((student, index) =>
                                student ? (
                                  <div
                                    key={index}
                                    className="text-sm flex items-center justify-between"
                                  >
                                    <div className="flex items-center">
                                      {student.profilePicture ? (
                                        <img
                                          src={student.profilePicture}
                                          alt={`${student.firstName} ${student.lastName}`}
                                          className="w-6 h-6 rounded-full mr-2 object-cover"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-ninja-crimson/10 flex items-center justify-center mr-2">
                                          <span className="text-xs text-ninja-crimson">
                                            {student.firstName?.charAt(0)}
                                            {student.lastName?.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                      <span className="text-ninja-black">
                                        {student.firstName} {student.lastName}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            student.isCompleted
                                              ? "bg-green-500"
                                              : "bg-ninja-crimson"
                                          }`}
                                          style={{
                                            width: `${
                                              student.readingProgress || 0
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-600">
                                        {student.readingProgress || 0}%
                                        {student.isCompleted && (
                                          <span className="ml-1 text-green-500">
                                            ✓
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}

                        {/* <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-ninja-crimson h-2.5 rounded-full"
                            style={{
                              width: `${assignment.readingProgress}%`,
                            }}
                          ></div>
                        </div> */}
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
            {/* <TabsContent value="completed">
              {assignments.filter((assignment) => assignment.isCompleted)
                .length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-ninja-crimson opacity-50" />
                  <p className="mt-4 text-ninja-black">
                    No completed assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments
                    .filter((assignment) => assignment.isCompleted)
                    .map((assignment) => (
                      <div
                        key={assignment._id}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-ninja-black">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Book: {assignment.storyId.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              Completed by:{" "}
                              {assignment.studentId
                                ? assignment.studentId.firstName +
                                  " " +
                                  assignment.studentId.lastName
                                : "Entire Class"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Sarah Johnson
                </span>{" "}
                submitted a new story{" "}
                <span className="font-medium text-ninja-crimson">
                  &quot;The Magic Tree&quot;
                </span>{" "}
                for review.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">
                Today at 10:45 AM
              </p>
            </div>

            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Michael Brown
                </span>{" "}
                revised their story{" "}
                <span className="font-medium text-ninja-crimson">
                  &quot;Space Adventures&quot;
                </span>{" "}
                based on your feedback.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">
                Yesterday at 3:20 PM
              </p>
            </div>

            <div className="bg-ninja-darker p-4 rounded-lg border border-ninja-white/10">
              <p className="text-sm text-ninja-white">
                <span className="font-medium text-ninja-crimson">
                  Emma Davis
                </span>{" "}
                joined your class.
              </p>
              <p className="text-xs text-ninja-white/70 mt-1">2 days ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

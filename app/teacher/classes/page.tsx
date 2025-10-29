"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, Users } from "lucide-react";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Class {
  _id: string;
  className: string;
  grade: {
    _id: string;
    gradeNumber: number;
    name: string;
  };
  teachers: Teacher[];
  capacity?: number;
  isActive?: boolean;
  academicYear?: string;
}

export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teacher/classes/access");

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        setClasses(data.classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter classes based on search term
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Grade ${classItem.grade.gradeNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-ninja-light-gray text-ninja-black">
        <CardHeader className="text-ninja-black">
          <CardTitle>Assigned Classes</CardTitle>
          <CardDescription>
            Classes you have been assigned to teach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No classes match your search"
                  : "You have not been assigned to any classes yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-ninja-black">
                  <TableHead className="text-ninja-black">
                    {" "}
                    Class Name
                  </TableHead>
                  <TableHead className="text-ninja-black">Grade</TableHead>
                  <TableHead className="text-right text-ninja-black">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((classItem) => (
                  <TableRow key={classItem._id}>
                    <TableCell className="font-medium">
                      {classItem.className}
                    </TableCell>
                    <TableCell>
                      Grade {classItem.grade.gradeNumber} -{" "}
                      {classItem.grade.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/teacher/classes/${classItem._id}/students`
                          )
                        }
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Students
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

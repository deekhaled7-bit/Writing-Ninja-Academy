"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientPageProps } from "@/types/page-props";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isAssigned?: boolean;
}

interface Class {
  _id: string;
  className: string;
  section: string;
  grade: {
    _id: string;
    gradeNumber: number;
    name: string;
  };
  teachers: Teacher[];
  capacity: number;
  isActive: boolean;
  academicYear: string;
}

export default function AssignTeachersPage({ params }: ClientPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const [classData, setClassData] = useState<Class | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return; // Only fetch data when id is available

      try {
        setLoading(true);

        // Fetch class data
        const classResponse = await fetch(`/api/admin/classes/${id}`);
        if (!classResponse.ok) {
          throw new Error("Failed to fetch class data");
        }
        const classResult = await classResponse.json();

        // Fetch all teachers
        const teachersResponse = await fetch("/api/admin/users?role=teacher");
        if (!teachersResponse.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const teachersResult = await teachersResponse.json();

        // Mark teachers that are already assigned to this class
        const assignedTeacherIds = new Set(
          classResult.class.teachers.map((t: Teacher) => t._id)
        );
        const allTeachers = teachersResult.users.map((teacher: Teacher) => ({
          ...teacher,
          isAssigned: assignedTeacherIds.has(teacher._id),
        }));

        setClassData(classResult.class);
        setTeachers(allTeachers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTeacherToggle = (teacherId: string) => {
    setTeachers((prevTeachers) =>
      prevTeachers.map((teacher) =>
        teacher._id === teacherId
          ? { ...teacher, isAssigned: !teacher.isAssigned }
          : teacher
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const assignedTeacherIds = teachers
        .filter((teacher) => teacher.isAssigned)
        .map((teacher) => teacher._id);

      const response = await fetch(`/api/admin/classes/${id}/assign-teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherIds: assignedTeacherIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign teachers");
      }

      toast({
        title: "Success",
        description: "Teachers assigned successfully",
      });

      // Navigate back to classes page
      router.push("/admin/classes");
    } catch (error: any) {
      console.error("Error assigning teachers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign teachers",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg">Class not found</p>
        <Button onClick={() => router.push("/admin/classes")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/classes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Assign Teachers</h1>
        </div>
        <Button
          className="bg-ninja-crimson hover:bg-ninja-coral"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Assignments
        </Button>
      </div>

      <Card className="bg-ninja-light-gray">
        <CardHeader>
          <CardTitle>
            {classData.className} {classData.section} - Grade{" "}
            {classData.grade.gradeNumber}
          </CardTitle>
          <CardDescription>
            Assign teachers to this class for the {classData.academicYear}{" "}
            academic year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No teachers found in the system.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Assign</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell>
                      <Checkbox
                        checked={teacher.isAssigned}
                        onCheckedChange={() => handleTeacherToggle(teacher._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </TableCell>
                    <TableCell>{teacher.email}</TableCell>
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

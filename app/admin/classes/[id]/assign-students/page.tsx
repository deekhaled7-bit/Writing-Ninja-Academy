'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientPageProps } from '@/types/page-props';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAssigned?: boolean;
}

interface ClassData {
  _id: string;
  name: string;
  students: Student[];
}

export default function AssignStudentsPage({ params }: ClientPageProps) {
  const router = useRouter();
  const classId = params.id;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch class data
        const classResponse = await fetch(`/api/admin/classes/${classId}`);
        if (!classResponse.ok) {
          throw new Error('Failed to fetch class data');
        }
        const classJson = await classResponse.json();
        setClassData(classJson.class);

        // Fetch all students
        const studentsResponse = await fetch('/api/admin/students');
        if (!studentsResponse.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsJson = await studentsResponse.json();
        
        // Fetch assigned students
        const assignedResponse = await fetch(`/api/admin/classes/${classId}/assign-students`);
        if (!assignedResponse.ok) {
          throw new Error('Failed to fetch assigned students');
        }
        const assignedJson = await assignedResponse.json();
        const assignedStudentIds = assignedJson.students.map((student: Student) => student._id);
        
        // Mark students as assigned
        const studentsWithAssignmentStatus = studentsJson.students.map((student: Student) => ({
          ...student,
          isAssigned: assignedStudentIds.includes(student._id)
        }));
        
        setStudents(studentsWithAssignmentStatus);
        setFilteredStudents(studentsWithAssignmentStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleToggleStudent = (studentId: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === studentId
          ? { ...student, isAssigned: !student.isAssigned }
          : student
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const studentIds = students
        .filter((student) => student.isAssigned)
        .map((student) => student._id);

      const response = await fetch(`/api/admin/classes/${classId}/assign-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign students');
      }

      toast.success('Students assigned successfully');
      router.push(`/admin/classes/${classId}`);
    } catch (error: any) {
      console.error('Error saving student assignments:', error);
      toast.error(error.message || 'Failed to assign students');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Students to {classData?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-muted-foreground">No students found</p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={`student-${student._id}`}
                      checked={student.isAssigned}
                      onCheckedChange={() => handleToggleStudent(student._id)}
                    />
                    <Label
                      htmlFor={`student-${student._id}`}
                      className="flex cursor-pointer flex-col"
                    >
                      <span className="font-medium">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">{student.email}</span>
                    </Label>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/classes/${classId}`)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
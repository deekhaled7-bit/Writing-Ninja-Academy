'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Mail } from 'lucide-react';

type Student = {
  id: string;
  name: string;
  email: string;
  storiesCount: number;
  joinedAt: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real application, you would fetch students from your API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          storiesCount: 5,
          joinedAt: '2023-01-15',
        },
        {
          id: '2',
          name: 'Michael Brown',
          email: 'michael.b@example.com',
          storiesCount: 3,
          joinedAt: '2023-02-01',
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma.d@example.com',
          storiesCount: 0,
          joinedAt: '2023-05-10',
        },
        {
          id: '4',
          name: 'Alex Wilson',
          email: 'alex.w@example.com',
          storiesCount: 7,
          joinedAt: '2023-01-05',
        },
        {
          id: '5',
          name: 'Oliver Thompson',
          email: 'oliver.t@example.com',
          storiesCount: 2,
          joinedAt: '2023-03-20',
        },
      ];
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewStories = (studentId: string) => {
    // In a real application, you would navigate to the student's stories page
    console.log(`Viewing stories for student ${studentId}`);
  };

  const handleContactStudent = (studentId: string) => {
    // In a real application, you would open a contact form or email client
    console.log(`Contacting student ${studentId}`);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Students</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stories</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.storiesCount}</TableCell>
                  <TableCell>{student.joinedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewStories(student.id)}
                      title="View student's stories"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleContactStudent(student.id)}
                      title="Contact student"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
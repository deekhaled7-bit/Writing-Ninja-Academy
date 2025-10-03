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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle, Users } from "lucide-react";

interface Grade {
  _id: string;
  gradeNumber: number;
  name: string;
}

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
  createdAt: string;
  updatedAt: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    className: "",
    grade: "",
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/classes");

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

  const fetchGrades = async () => {
    try {
      const response = await fetch("/api/admin/grades");

      if (!response.ok) {
        throw new Error("Failed to fetch grades");
      }

      const data = await response.json();
      setGrades(data.grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast({
        title: "Error",
        description: "Failed to load grades. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    Promise.all([fetchClasses(), fetchGrades()]);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Switch handler removed as isActive field is no longer needed

  const resetForm = () => {
    setFormData({
      className: "",
      grade: "",
    });
  };

  const handleCreateClass = async () => {
    try {
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
      }

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      setOpenCreateDialog(false);
      resetForm();
      fetchClasses();
    } catch (error: any) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const handleEditClass = async () => {
    if (!currentClass) return;

    try {
      const response = await fetch(`/api/admin/classes/${currentClass._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update class");
      }

      toast({
        title: "Success",
        description: "Class updated successfully",
      });

      setOpenEditDialog(false);
      resetForm();
      fetchClasses();
    } catch (error: any) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update class",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!currentClass) return;

    try {
      const response = await fetch(`/api/admin/classes/${currentClass._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete class");
      }

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });

      setOpenDeleteDialog(false);
      fetchClasses();
    } catch (error: any) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (classItem: Class) => {
    setCurrentClass(classItem);
    setFormData({
      className: classItem.className,
      grade: classItem.grade._id,
    });
    setOpenEditDialog(true);
  };

  const openDeleteModal = (classItem: Class) => {
    setCurrentClass(classItem);
    setOpenDeleteDialog(true);
  };

  const navigateToAssignTeachers = (classId: string) => {
    router.push(`/admin/classes/${classId}/assign-teachers`);
  };

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
        <h1 className="text-2xl font-bold">Class Management</h1>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-ninja-crimson hover:bg-ninja-coral">
              <Plus className="mr-2 h-4 w-4" /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  placeholder="Class Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleSelectChange("grade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade._id} value={grade._id}>
                        {grade.name} (Grade {grade.gradeNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-ninja-crimson hover:bg-ninja-coral"
                onClick={handleCreateClass}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Manage all classes in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No classes found. Create your first class to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-ninja-white">Class Name</TableHead>
                  <TableHead className="text-ninja-white">Grade</TableHead>
                  <TableHead className="text-ninja-white text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
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
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToAssignTeachers(classItem._id)}
                        title="Assign Teachers"
                      >
                        <Users className="h-4 w-4 text-ninja-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(classItem)}
                        title="Edit Class"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(classItem)}
                        title="Delete Class"
                      >
                        <Trash2 className="h-4 w-4 text-ninja-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update class information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-className">Class Name</Label>
              <Input
                id="edit-className"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Grade</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => handleSelectChange("grade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade._id} value={grade._id}>
                      {grade.name} (Grade {grade.gradeNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-ninja-crimson hover:bg-ninja-coral"
              onClick={handleEditClass}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentClass?.className}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">
              Warning: Deleting a class will remove all teacher and student
              assignments.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClass}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

interface Grade {
  _id: string;
  gradeNumber: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function GradesPage() {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    gradeNumber: "",
    name: "",
    description: "",
  });

  const fetchGrades = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      gradeNumber: "",
      name: "",
      description: "",
    });
  };

  const handleCreateGrade = async () => {
    try {
      const response = await fetch("/api/admin/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gradeNumber: parseInt(formData.gradeNumber),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create grade");
      }

      toast({
        title: "Success",
        description: "Grade created successfully",
      });

      setOpenCreateDialog(false);
      resetForm();
      fetchGrades();
    } catch (error: any) {
      console.error("Error creating grade:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create grade",
        variant: "destructive",
      });
    }
  };

  const handleEditGrade = async () => {
    if (!currentGrade) return;

    try {
      const response = await fetch(`/api/admin/grades/${currentGrade._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          gradeNumber: parseInt(formData.gradeNumber),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update grade");
      }

      toast({
        title: "Success",
        description: "Grade updated successfully",
      });

      setOpenEditDialog(false);
      resetForm();
      fetchGrades();
    } catch (error: any) {
      console.error("Error updating grade:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update grade",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGrade = async () => {
    if (!currentGrade) return;

    try {
      const response = await fetch(`/api/admin/grades/${currentGrade._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete grade");
      }

      toast({
        title: "Success",
        description: "Grade deleted successfully",
      });

      setOpenDeleteDialog(false);
      fetchGrades();
    } catch (error: any) {
      console.error("Error deleting grade:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (grade: Grade) => {
    setCurrentGrade(grade);
    setFormData({
      gradeNumber: grade.gradeNumber.toString(),
      name: grade.name,
      description: grade.description || "",
      // academicYear: grade.academicYear,
      // isActive: grade.isActive
    });
    setOpenEditDialog(true);
  };

  const openDeleteModal = (grade: Grade) => {
    setCurrentGrade(grade);
    setOpenDeleteDialog(true);
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
        <h1 className="text-2xl font-bold">Grade Management</h1>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-ninja-crimson hover:bg-ninja-coral">
              <Plus className="mr-2 h-4 w-4" /> Add Grade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Grade</DialogTitle>
              <DialogDescription>
                Add a new grade to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="gradeNumber">Grade Number</Label>
                <Input
                  id="gradeNumber"
                  name="gradeNumber"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.gradeNumber}
                  onChange={handleInputChange}
                  placeholder="1-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Grade Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="First Grade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description of the grade"
                />
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
                onClick={handleCreateGrade}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-ninja-light-gray">
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>Manage all grades in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-ninja-black">
                No grades found. Create your first grade to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="text-ninja-black">Grade</TableHead>
                  <TableHead className="text-ninja-black">Name</TableHead>
                  <TableHead className="text-ninja-black text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade._id}>
                    <TableCell className="font-medium">
                      {grade.gradeNumber}
                    </TableCell>
                    <TableCell>{grade.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(grade)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(grade)}
                      >
                        <Trash2 className="h-4 w-4 text-ninja-black" />
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
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>Update grade information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gradeNumber">Grade Number</Label>
              <Input
                id="edit-gradeNumber"
                name="gradeNumber"
                type="number"
                min="1"
                max="12"
                value={formData.gradeNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Grade Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-ninja-crimson hover:bg-ninja-coral"
              onClick={handleEditGrade}
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
              Are you sure you want to delete {currentGrade?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">
              Warning: Deleting a grade may affect associated classes and
              students.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGrade}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

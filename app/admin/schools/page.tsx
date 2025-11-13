"use client";

import { useEffect, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";

interface School {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/schools");

      if (!response.ok) {
        throw new Error("Failed to fetch schools");
      }

      const data = await response.json();
      setSchools(data.schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "Failed to load schools. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "" });
  };

  const handleCreateSchool = async () => {
    try {
      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create school");
      }

      toast({ title: "School created" });
      setOpenCreateDialog(false);
      resetForm();
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create school.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSchool = async () => {
    if (!currentSchool) return;
    try {
      const response = await fetch(`/api/admin/schools/${currentSchool._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update school");
      }

      toast({ title: "School updated" });
      setOpenEditDialog(false);
      resetForm();
      setCurrentSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update school.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchool = async () => {
    if (!currentSchool) return;
    try {
      const response = await fetch(`/api/admin/schools/${currentSchool._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete school");
      }

      toast({ title: "School deleted" });
      setOpenDeleteDialog(false);
      setCurrentSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete school.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schools</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Schools</CardTitle>
            <CardDescription>
              Create, edit, and remove schools used across the platform.
            </CardDescription>
          </div>
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" /> Add School
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add School</DialogTitle>
                <DialogDescription>
                  Provide the school name to create a new entry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Green Valley Elementary"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSchool}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ninja-crimson"></div>
            </div>
          ) : schools.length === 0 ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>No schools found.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school._id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog
                        open={openEditDialog && currentSchool?._id === school._id}
                        onOpenChange={(open) => {
                          setOpenEditDialog(open);
                          if (!open) {
                            setCurrentSchool(null);
                            resetForm();
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentSchool(school);
                              setFormData({ name: school.name });
                              setOpenEditDialog(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit School</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdateSchool}>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={openDeleteDialog && currentSchool?._id === school._id}
                        onOpenChange={(open) => {
                          setOpenDeleteDialog(open);
                          if (!open) setCurrentSchool(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setCurrentSchool(school);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete School</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. Are you sure you want to
                              delete <span className="font-semibold">{school.name}</span>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSchool}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
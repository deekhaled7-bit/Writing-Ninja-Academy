"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Search, Edit, Trash2, Plus, AlertCircle } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
  gradeId?: string;
  grade?: {
    _id: string;
    name: string;
    gradeNumber: number;
    schoolID?: { _id: string; name: string };
  };
  gradeName?: string;
  gradeNumber?: number | string;
  schoolName?: string;
  assignedClasses?: { className: string; _id: string }[];
  classNames?: string[];
  primaryClassName?: string;
  primaryGradeName?: string;
  primaryGradeNumber?: number | string;
  primarySchoolName?: string;
  primarySchoolId?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    active: false,
    verified: false,
    schoolId: "" as string | undefined,
    gradeId: "" as string | undefined,
    assignedClasses: [] as string[],
    classId: "",
  });

  // States for schools, grades and classes
  const [schools, setSchools] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/users";

      // Add query parameters if filters are applied
      const params = new URLSearchParams();
      if (selectedRole !== "all") {
        params.append("role", selectedRole);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      // data.users.map((user: User, index: Number) => {
      //   if (user.gradeId) {
      //     console.log("testID" + user.gradeId);
      //   }
      // });
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch schools
  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await fetch("/api/admin/schools");
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      } else {
        console.error("Failed to fetch schools");
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoadingSchools(false);
    }
  };

  // Fetch grades for selected school
  const fetchGrades = async (schoolId?: string) => {
    try {
      setLoadingGrades(true);
      let url = "/api/admin/grades";
      if (schoolId) url += `?schoolId=${schoolId}`;
      const response = await fetch(url);
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

  // Fetch classes based on selected grade
  const fetchClasses = async (grade: string) => {
    if (!grade) {
      setClasses([]);
      return;
    }

    try {
      setLoadingClasses(true);
      const response = await fetch(`/api/admin/classes?grade=${grade}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      } else {
        console.error("Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, searchTerm]);

  // Fetch schools when component mounts
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch grades when school changes
  // useEffect(() => {
  //   if (formData.role === "student") {
  //     if (formData.schoolId) {
  //       fetchGrades(formData.schoolId);
  //     } else {
  //       setGrades([]);
  //     }
  //     // Reset dependent selections
  //     setFormData((prev) => ({
  //       ...prev,
  //       gradeId: "",
  //       classId: "",
  //       assignedClasses: [],
  //     }));
  //     setClasses([]);
  //   }
  // }, [formData.schoolId, formData.role]);

  // Fetch classes when grade changes
  // useEffect(() => {
  //   if (formData.role === "student") {
  //     if (formData.gradeId) {
  //       fetchClasses(formData.gradeId);
  //     } else {
  //       setClasses([]);
  //     }
  //     // Reset class selection when grade changes
  //     setFormData((prev) => ({ ...prev, classId: "", assignedClasses: [] }));
  //   }
  // }, [formData.gradeId, formData.role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    if (name === "schoolId") {
      const schoolId = value as string;
      fetchGrades(schoolId);
      setFormData((prev) => ({
        ...prev,
        [name]: schoolId,
        gradeId: "",
        classId: "",
        assignedClasses: [],
      }));
      setClasses([]);
    } else if (name === "gradeId") {
      const gradeId = value as string;
      fetchClasses(gradeId);
      setFormData((prev) => ({
        ...prev,
        [name]: gradeId,
        classId: "",
        assignedClasses: [],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "student",
      active: false,
      verified: false,
      schoolId: "",
      gradeId: "",
      assignedClasses: [],
      classId: "",
    });
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setOpenCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!currentUser) return;

    try {
      // Remove password if it's empty (not being updated)
      const dataToSend: Partial<typeof formData> = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await fetch(`/api/admin/users/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setOpenEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/admin/users/${currentUser._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditModal = async (user: User, e?: React.MouseEvent) => {
    // Prevent the email from being set as search term
    e?.preventDefault();
    e?.stopPropagation();

    setCurrentUser(user);

    // Initialize form data with user information
    const initialFormData = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: "", // Don't populate password
      role: user.role,
      active: user.active,
      verified: user.verified,
      schoolId: (user as any).primarySchoolId || undefined,
      gradeId: user.gradeId || undefined,
      assignedClasses: [] as string[],
      classId: "" as string,
    };

    // If user is a student, fetch their grade and class information
    if (user.role === "student") {
      try {
        // const response = await fetch(`/api/admin/users/${user._id}/details`);
        // if (response.ok) {
        //   const data = await response.json();
        // Update form data with grade and class information
        initialFormData.gradeId = user.gradeId || undefined;
        initialFormData.classId =
          user.assignedClasses && user.assignedClasses.length > 0
            ? user.assignedClasses[0]._id
            : "";
        // alert(initialFormData.classId);
        // alert(formData.classId);

        // Fetch classes for the selected grade
        if (initialFormData.schoolId) {
          await fetchGrades(initialFormData.schoolId);
        } else {
          setGrades([]);
        }
        if (initialFormData.gradeId) {
          await fetchClasses(initialFormData.gradeId);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    setFormData(initialFormData);
    setOpenEditDialog(true);
  };

  const openDeleteModal = (user: User) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };

  // Filter users based on search term and selected role (client-side filtering as backup)
  const filteredUsers = users.filter((user) => {
    // This is a backup filter in case the API filtering doesn't work
    // The primary filtering should happen on the server side
    if (selectedRole !== "all" && user.role !== selectedRole) {
      return false;
    }

    if (
      searchTerm &&
      !(
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin  rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-ninja-crimson hover:bg-ninja-coral">
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="schoolId">School</Label>
                    <Select
                      value={formData.schoolId || undefined}
                      onValueChange={(value) =>
                        handleSelectChange("schoolId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select School" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingSchools ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : schools.length === 0 ? (
                          <SelectItem value="no-schools" disabled>
                            No schools available
                          </SelectItem>
                        ) : (
                          schools.map((school) => (
                            <SelectItem key={school._id} value={school._id}>
                              {school.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeId">Grade</Label>
                    <Select
                      value={formData.gradeId || undefined}
                      onValueChange={(value) =>
                        handleSelectChange("gradeId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingGrades ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : !formData.schoolId ? (
                          <SelectItem value="select-school-first" disabled>
                            Select a school first
                          </SelectItem>
                        ) : grades.length === 0 ? (
                          <SelectItem value="no-grades" disabled>
                            No grades available
                          </SelectItem>
                        ) : (
                          grades.map((grade) => (
                            <SelectItem key={grade._id} value={grade._id}>
                              Grade {grade.gradeNumber}: {grade.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.gradeId && (
                    <div className="space-y-2">
                      <Label htmlFor="assignedClasses">Class</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) => {
                          handleSelectChange("assignedClasses", [value]);
                          handleSelectChange("classId", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingClasses ? (
                            <SelectItem value="loading-classes" disabled>
                              Loading...
                            </SelectItem>
                          ) : classes.length === 0 ? (
                            <SelectItem value="no-classes" disabled>
                              No classes available for this grade
                            </SelectItem>
                          ) : (
                            classes.map((classItem) => (
                              <SelectItem
                                key={classItem._id}
                                value={classItem._id}
                              >
                                {classItem.className}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-ninja-crimson focus:ring-ninja-coral"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified"
                      name="verified"
                      checked={formData.verified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          verified: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-ninja-crimson focus:ring-ninja-coral"
                    />
                    <Label htmlFor="verified">Verified</Label>
                  </div>
                </div>
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
                onClick={handleCreateUser}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border w-full overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="hover:bg-ninja-peach/20">
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-ninja-peach/20 ">
                  <TableCell>
                    <Avatar className="h-10 w-10 bg-ninja-white border-ninja-crimson border-2">
                      <AvatarImage
                        src={user.profilePicture || ""}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="bg-ninja-peach text-ninja-black font-semibold">
                        {user.firstName?.[0]?.toUpperCase()}
                        {user.lastName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.role === "student" &&
                    (user.primaryClassName ||
                      (user.assignedClasses && user.assignedClasses[0]))
                      ? String(
                          user.primaryClassName ??
                            user.assignedClasses?.[0]?.className ??
                            "-"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {user.role === "student" &&
                    (user.primaryGradeName || user.gradeName || user.grade)
                      ? `Grade ${String(
                          user.primaryGradeNumber ??
                            user.gradeNumber ??
                            (user.grade as any)?.gradeNumber
                        )}: ${String(
                          user.primaryGradeName ??
                            user.gradeName ??
                            (user.grade as any)?.name
                        )}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {user.role === "student" &&
                    (user.primarySchoolName ||
                      user.schoolName ||
                      (user.grade as any)?.schoolID)
                      ? String(
                          user.primarySchoolName ??
                            user.schoolName ??
                            (user.grade as any)?.schoolID?.name ??
                            "-"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center w-fit ${
                          user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center w-fit ${
                          user.verified
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="default"
                      size="icon"
                      onClick={(e) => openEditModal(user, e)}
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4 hover:text-ninja-peach" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => openDeleteModal(user)}
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4 hover:text-ninja-peach" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password (leave blank to keep current)
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-schoolId">School</Label>
                  <Select
                    value={formData.schoolId || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("schoolId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSchools ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : schools.length === 0 ? (
                        <SelectItem value="no-schools" disabled>
                          No schools available
                        </SelectItem>
                      ) : (
                        schools.map((school) => (
                          <SelectItem key={school._id} value={school._id}>
                            {school.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-grade">Grade</Label>
                  <Select
                    value={formData.gradeId || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("gradeId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingGrades ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : !formData.schoolId ? (
                        <SelectItem value="select-school-first" disabled>
                          Select a school first
                        </SelectItem>
                      ) : grades.length === 0 ? (
                        <SelectItem value="no-grades" disabled>
                          No grades available
                        </SelectItem>
                      ) : (
                        grades.map((grade) => (
                          <SelectItem key={grade._id} value={grade._id}>
                            Grade {grade.gradeNumber}: {grade.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {formData.gradeId && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignedClasses">Class</Label>
                    <Select
                      value={
                        formData.classId && formData.classId.length > 0
                          ? formData.classId
                          : undefined
                      }
                      onValueChange={(value) =>
                        handleSelectChange("assignedClasses", [value])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingClasses ? (
                          <SelectItem value="loading-classes" disabled>
                            Loading...
                          </SelectItem>
                        ) : classes.length === 0 ? (
                          <SelectItem value="no-classes" disabled>
                            No classes available for this grade
                          </SelectItem>
                        ) : (
                          classes.map((classItem) => (
                            <SelectItem
                              key={classItem._id}
                              value={classItem._id}
                            >
                              {classItem.className}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    name="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-ninja-crimson focus:ring-ninja-coral"
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-verified"
                    name="verified"
                    checked={formData.verified}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        verified: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-ninja-crimson focus:ring-ninja-coral"
                  />
                  <Label htmlFor="edit-verified">Verified</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-ninja-crimson hover:bg-ninja-coral"
              onClick={handleEditUser}
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
              Are you sure you want to delete {currentUser?.firstName}{" "}
              {currentUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">
              Warning: Deleting a user will remove all associated data.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

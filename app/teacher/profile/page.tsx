"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  // bio: string;
  // interests: string;
  avatarUrl: string | null;
};

export default function TeacherProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    // bio: "",
    // interests: "",
    avatarUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Fetch the user profile from the API
    const fetchUserProfile = async () => {
      if (session?.user) {
        try {
          // First, initialize profile with session data to ensure we have something to display
          const sessionProfilePicture =
            session.user.profilePicture || session.user.image || null;

          // Set initial profile from session data
          setProfile({
            firstName: session.user.firstName || "",
            lastName: session.user.lastName || "",
            email: session.user.email || "",
            avatarUrl: sessionProfilePicture,
          });

          // Then fetch from API to get the most up-to-date data
          const response = await fetch("/api/user/profile");

          if (response.ok) {
            const data = await response.json();

            // Extract profile picture URL from various possible sources
            const profilePictureUrl =
              data.user.profilePicture ||
              data.user.image ||
              session.user.profilePicture ||
              session.user.image ||
              null;

            // Update profile with API data
            const updatedProfile = {
              firstName: data.user.firstName || session.user.firstName || "",
              lastName: data.user.lastName || session.user.lastName || "",
              email: data.user.email || session.user.email || "",
              avatarUrl: profilePictureUrl,
            };

            setProfile(updatedProfile);
          } else {
            console.error("API response not OK:", await response.text());
            toast({
              title: "Warning",
              description:
                "Could not fetch profile data from server. Using session data instead.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error",
            description:
              "Failed to fetch profile data. Using session data instead.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      try {
        toast({
          title: "Uploading...",
          description: "Uploading your profile picture...",
        });

        // Upload the file to the server
        const response = await fetch("/api/user/profile/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to upload profile picture"
          );
        }

        const data = await response.json();

        // Update the profile state with the new avatar URL
        setProfile((prev) => ({
          ...prev,
          avatarUrl: data.imageUrl,
        }));

        // Clear the preview image as we now have the actual uploaded image
        setPreviewImage(null);

        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        });
      } catch (error: any) {
        console.error("Error uploading profile picture:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to upload profile picture",
          variant: "destructive",
        });
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update the profile via API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to update profile");
        } catch (jsonError) {
          throw new Error("Failed to update profile: " + errorText);
        }
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update password");
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
        <p className="ml-4">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-ninja-white">
            <CardHeader>
              <CardTitle>Teacher Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      className="placeholder:text-ninja-gray"
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      placeholder={profile.firstName || "Enter your first name"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="placeholder:text-ninja-white bg-gray-100"
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-4 ">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="mb-2 w-full flex justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview of new profile picture"
                        className="w-40 h-40 rounded-full object-cover border-2 border-ninja-peach bg-ninja-white"
                      />
                    ) : profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Current profile picture"
                        className="w-40 h-40 p-2 rounded-full object-cover border-2 border-ninja-peach bg-ninja-white"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-2 border-ninja-crimson">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-ninja-crimson text-white hover:bg-ninja-crimson/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="bg-ninja-white">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-ninja-crimson text-white hover:bg-ninja-crimson/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

export default function ProfilePage() {
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
          console.log(
            "Fetching user profile with session:",
            JSON.stringify(session.user, null, 2)
          );

          // First, initialize profile with session data to ensure we have something to display
          const sessionProfilePicture =
            session.user.profilePicture || session.user.image || null;

          // Set initial profile from session data
          setProfile({
            firstName: session.user.firstName || "",
            lastName: session.user.lastName || "",
            email: session.user.email || "",
            // bio: session.user.bio || "I love reading and writing adventure stories!",
            // interests: session.user.interests || "Fantasy, Science Fiction, Mystery",
            avatarUrl: sessionProfilePicture,
          });

          // Then fetch from API to get the most up-to-date data
          const response = await fetch("/api/user/profile");

          if (response.ok) {
            const data = await response.json();
            console.log("API response data:", JSON.stringify(data, null, 2));

            // Extract profile picture URL from various possible sources
            const profilePictureUrl =
              data.user.profilePicture ||
              data.user.image ||
              session.user.profilePicture ||
              session.user.image ||
              null;

            console.log("Profile picture URL:", profilePictureUrl);
            console.log("First name from API:", data.user.firstName);
            console.log("Last name from API:", data.user.lastName);
            console.log("Email from API:", data.user.email);
            console.log("Bio from API:", data.user.bio);
            console.log("Interests from API:", data.user.interests);

            // Update profile with API data
            const updatedProfile = {
              firstName: data.user.firstName || session.user.firstName || "",
              lastName: data.user.lastName || session.user.lastName || "",
              email: data.user.email || session.user.email || "",
              // bio:
              //   data.user.bio ||
              //   session.user.bio ||
              //   "I love reading and writing adventure stories!",
              // interests:
              //   data.user.interests ||
              //   session.user.interests ||
              //   "Fantasy, Science Fiction, Mystery",
              avatarUrl: profilePictureUrl,
            };

            console.log("Setting profile to:", updatedProfile);
            setProfile(updatedProfile);
          } else {
            console.error("API response not OK:", await response.text());
            // We already set the profile from session data above, so no need to do it again
            toast({
              title: "Warning",
              description:
                "Could not fetch profile data from server. Using session data instead.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // We already set the profile from session data above, so no need to do it again
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
        console.error("No session data available");
        setLoading(false);
        toast({
          title: "Error",
          description: "You must be logged in to view your profile.",
          variant: "destructive",
        });
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setProfile((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      console.log("Updated profile state:", updated);
      return updated;
    });
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
        console.log("Upload response:", data);

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
        // Keep the preview image in case the user wants to try uploading again
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting profile update with data:", profile);

      // Update the profile via API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          // bio: profile.bio,
          // interests: profile.interests,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile update failed with response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to update profile");
        } catch (jsonError) {
          throw new Error("Failed to update profile: " + errorText);
        }
      }

      const responseData = await response.json();
      console.log("Profile update successful:", responseData);

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

  console.log("Rendering profile with data:", profile);

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-6">My Profile</h1> */}

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
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
                    <p className="text-xs text-gray-500">
                      Current value: {profile.firstName || "(empty)"}
                    </p>
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
                    <p className="text-xs text-gray-500">
                      Current value: {profile.lastName || "(empty)"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="placeholder:text-ninja-white"
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

                {/* <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                  />
                  <p className="text-xs text-gray-500">
                    Current value: {profile.bio || "(empty)"}
                  </p>
                </div> */}

                {/* <div className="space-y-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    name="interests"
                    value={profile.interests}
                    onChange={handleInputChange}
                    placeholder="Fantasy, Adventure, Mystery"
                  />
                  <p className="text-xs text-gray-500">
                    Current value: {profile.interests || "(empty)"}
                  </p>
                </div> */}

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
                  className="bg-ninja-peach text-ninja-black hover:bg-ninja-peach/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
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
                  className="bg-ninja-peach text-ninja-black hover:bg-ninja-peach/90"
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

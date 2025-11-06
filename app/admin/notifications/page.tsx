"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

interface AdminNotification {
  _id: string;
  message?: string;
  createdAt: string;
  readByAdmin: boolean;
  link?: string;
  actionType: "like" | "unlike" | "comment" | "reply" | "completed";
  targetType: "story" | "comment" | "reply" | "quiz" | "assignment";
  targetId?: string;
  parentId?: string | { _id: string; title?: string };
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/admin/notifications`);
        if (res.ok) {
          const data = await res.json();
          // Filter to only story/comment/reply just in case
          const filtered = data.filter((n: AdminNotification) =>
            ["story", "comment", "reply"].includes(n.targetType)
          );
          setNotifications(filtered);
        }
      } catch (e) {
        console.error("Error fetching admin notifications:", e);
      } finally {
        setLoading(false);
      }
    };

    // Fetch when session is available and user is admin
    if (session?.user?.role === "admin") {
      fetchNotifications();
    } else if (session) {
      // Non-admin users shouldn't access this page
      setLoading(false);
    }
  }, [session]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}/read`,
        { method: "PUT" }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, readByAdmin: true } : n
          )
        );
      }
    } catch (e) {
      console.error("Error marking admin notification as read:", e);
    }
  };

  const handleNotificationClick = async (notification: AdminNotification) => {
    if (!notification.readByAdmin) {
      await markAsRead(notification._id);
    }
    // Navigate if link exists
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  if (session && session.user.role !== "admin") {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Unauthorized</h1>
        <p className="text-gray-600">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-2 h-6 w-6" />
        Admin Notifications
      </h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-gray-500">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-colors ${
                !notification.readByAdmin ? "bg-ninja-cream" : "bg-blue-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 w-full">
                    {notification.userId?.profilePicture && (
                      <img
                        src={notification.userId.profilePicture}
                        alt={`${notification.userId.firstName} ${notification.userId.lastName}`}
                        className="w-14 h-14 border-2 border-ninja-crimson  rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 text-ninja-black">
                      <p className={`${!notification.readByAdmin ? "font-semibold" : ""}`}>
                        <span className="font-medium">
                          {notification.userId?.firstName} {notification.userId?.lastName}
                        </span>{" "}
                        <span>
                          {notification.actionType === "like" && "liked a"}
                          {notification.actionType === "comment" && "commented on a"}
                          {notification.actionType === "reply" && "replied to a"}{" "}
                          {notification.targetType}
                        </span>
                      </p>
                      {notification.link ? (
                        <a
                          href={notification.link}
                          className="text-blue-600 hover:underline block mt-1"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNotificationClick(notification);
                          }}
                        >
                          {notification.targetType === "story"
                            ? `View: ${
                                typeof notification.parentId !== "string"
                                  ? notification.parentId?.title || "story"
                                  : "story"
                              }`
                            : `View ${notification.targetType}`}
                        </a>
                      ) : (
                        <button
                          className="text-blue-600 hover:underline block mt-1"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          Mark as read
                        </button>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
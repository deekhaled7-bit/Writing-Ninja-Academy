"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  read: boolean;
  link: string;
  actionType: "like" | "unlike" | "comment" | "reply";
  targetType: "story" | "comment" | "reply";
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/notifications?userId=${session.user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        // Update the local state to mark the notification as read
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Handle navigation based on notification type if needed
    // For example, redirect to the specific interaction
    // router.push(`/student/stories/${notification.storyId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-2 h-6 w-6" />
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-gray-500">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-colors ${
                !notification.read ? "bg-ninja-cream" : "bg-blue-50"
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
                      <p
                        className={`${
                          !notification.read ? "font-semibold" : ""
                        }`}
                      >
                        <span className="font-medium">
                          {notification.userId?.firstName}{" "}
                          {notification.userId?.lastName}
                        </span>{" "}
                        <span>
                          {notification.actionType === "like" && "liked your"}
                          {notification.actionType === "comment" &&
                            "commented on your"}
                          {notification.actionType === "reply" &&
                            "replied to your"}{" "}
                          {notification.targetType}
                        </span>
                      </p>
                      {notification.link ? (
                        <a
                          href={notification.link}
                          className="text-blue-600 hover:underline block mt-1"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          View {notification.targetType}
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
                  {/* {!notification.read && (
                    <span className="h-3 w-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                  )} */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

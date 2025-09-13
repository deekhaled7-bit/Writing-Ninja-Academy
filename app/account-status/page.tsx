"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountStatusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("");

  // Get the reason from the URL query parameters
  const reason = searchParams.get("reason");

  useEffect(() => {
    // Set the appropriate message based on the reason
    if (reason === "inactive") {
      setStatusMessage(
        "Your account is currently inactive. Please contact an administrator to activate your account."
      );
    } else if (reason === "unverified") {
      setStatusMessage(
        "Your account has not been verified yet. Please contact an administrator to verify your account."
      );
    } else if (!reason) {
      setStatusMessage("No specific account status issue was provided.");
    } else {
      setStatusMessage(
        "Unknown account status issue. Please contact support for assistance."
      );
    }
  }, [reason, router]);

  const handleSignOut = async () => {
    try {
      // First clear the session from the database
      await fetch("/api/auth/logout");
      // Then use next-auth's signOut function
      const { signOut } = await import("next-auth/react");
      signOut({ callbackUrl: "/signin" });
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/signin");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900">
          Account Status Notice
        </h1>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-center text-amber-800">{statusMessage}</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>

          <Button
            variant="ghost"
            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>If you believe this is an error, please contact us at</p>
            <Link
              href="/contact"
              className="text-ninja-crimson hover:underline"
            >
              support@thewritingninjasacademy.org
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

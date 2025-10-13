import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-ninja-crimson/10 p-4 rounded-full">
            <Mail className="h-12 w-12 text-ninja-crimson" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a verification link to your email address. Please
          check your inbox and click the link to verify your account.
        </p>

        <div className="space-y-4">
          <div className="flex items-start text-left border-t border-gray-100 pt-4">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              If you don &apos;t see the email, check your spam folder or other
              email categories.
            </p>
          </div>

          <div className="flex items-start text-left">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              The verification link will expire after 20 minutes.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/signin"
            className="inline-block bg-ninja-crimson hover:bg-ninja-coral text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

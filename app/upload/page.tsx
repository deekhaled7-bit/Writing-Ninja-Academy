import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import UploadStoryForm from "@/components/upload/upload-story-form";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin?callbackUrl=/upload');
  }
  
  // Only allow teachers and admins to access this page
  if (session.user.role !== 'teacher' && session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-ninja-light-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-oswald text-4xl sm:text-5xl text-ninja-black mb-4">
            Share Your Story
          </h1>
          <p className="text-xl text-ninja-gray max-w-3xl mx-auto">
            Upload your amazing story and share it with fellow young writers
            around the world!
          </p>
        </div>
        <UploadStoryForm />
      </div>
    </div>
  );
}

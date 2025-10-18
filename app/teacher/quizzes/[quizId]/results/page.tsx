"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileBarChart, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

type QuizSubmission = {
  _id: string;
  score: number;
  totalPossibleScore: number;
  percentageScore: number;
  passed: boolean;
  completedAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function QuizResults({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizAndSubmissions();
  }, [params.quizId]);

  const fetchQuizAndSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await fetch(`/api/teacher/quizzes/${params.quizId}`);
      if (!quizResponse.ok) {
        toast.error("Failed to fetch quiz details");
        router.push("/teacher/quizzes");
        return;
      }
      
      const quizData = await quizResponse.json();
      setQuiz(quizData.quiz);
      
      // Fetch submissions
      const submissionsResponse = await fetch(`/api/teacher/quizzes/${params.quizId}/submissions`);
      if (submissionsResponse.ok) {
        const data = await submissionsResponse.json();
        setSubmissions(data.submissions);
      } else {
        toast.error("Failed to fetch quiz submissions");
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast.error("An error occurred while fetching quiz data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-ninja-cream p-4">
        <div className="text-center py-8">
          <p className="text-lg text-ninja-black">Quiz not found</p>
          <Button 
            onClick={() => router.push("/teacher/quizzes")}
            className="mt-4 bg-ninja-crimson hover:bg-ninja-crimson/90"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const passedSubmissions = submissions.filter(sub => sub.passed).length;
  const averageScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((sum, sub) => sum + sub.percentageScore, 0) / totalSubmissions)
    : 0;

  return (
    <div className="bg-ninja-cream p-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/teacher/quizzes")}
          className="text-ninja-black hover:text-ninja-crimson"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <h1 className="text-2xl font-bold text-ninja-black mt-2">{quiz.title} - Results</h1>
        <p className="text-ninja-white mt-1">{quiz.description}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <FileBarChart className="h-12 w-12 text-ninja-crimson mb-2" />
            <h3 className="text-lg font-medium text-ninja-black">Total Submissions</h3>
            <p className="text-3xl font-bold text-ninja-crimson">{totalSubmissions}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <UserCheck className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-medium text-ninja-black">Pass Rate</h3>
            <p className="text-3xl font-bold text-green-500">
              {totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0}%
            </p>
            <p className="text-sm text-ninja-white">
              {passedSubmissions} of {totalSubmissions} students passed
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6 flex flex-col items-center">
            <FileBarChart className="h-12 w-12 text-blue-500 mb-2" />
            <h3 className="text-lg font-medium text-ninja-black">Average Score</h3>
            <p className="text-3xl font-bold text-blue-500">{averageScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-ninja-black mb-4">Student Submissions</h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-ninja-white">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-ninja-black">Student</th>
                    <th className="px-4 py-2 text-left text-ninja-black">Score</th>
                    <th className="px-4 py-2 text-left text-ninja-black">Result</th>
                    <th className="px-4 py-2 text-left text-ninja-black">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-ninja-black">
                        {submission.student?.name || "Unknown Student"}
                      </td>
                      <td className="px-4 py-3 text-ninja-black">
                        {submission.score}/{submission.totalPossibleScore} ({submission.percentageScore}%)
                      </td>
                      <td className="px-4 py-3">
                        {submission.passed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="mr-1 h-3 w-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <UserX className="mr-1 h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ninja-white">
                        {new Date(submission.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
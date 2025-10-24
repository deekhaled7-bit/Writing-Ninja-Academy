"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, FileQuestion, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Quiz = {
  _id: string;
  title: string;
  description: string;
  questions: Array<{
    _id: string;
    questionText: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    points: number;
  }>;
  storyId?: {
    _id: string;
    title: string;
  };
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
};

type QuizSubmission = {
  _id: string;
  studentId: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  quizId: string;
  score: number;
  percentageScore: number;
  passed: boolean;
  completedAt: string;
  answers?: Array<{
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }>;
};

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  const [showSubmissionDetailsModal, setShowSubmissionDetailsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/quizzes");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes);
      } else {
        toast.error("Failed to fetch quizzes");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("An error occurred while fetching quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleShowResults = async (quizId: string) => {
    setLoadingResults(true);
    setShowResultsModal(true);

    try {
      const response = await fetch(
        `/api/teacher/quizzes/${quizId}/submissions`
      );
      if (response.ok) {
        const data = await response.json();
        // Store submissions with answer data
        setSubmissions(data.submissions);
        // Store the selected quiz for reference in the submission details modal
        const quiz = quizzes.find((q) => q._id === quizId);
        setSelectedQuiz(quiz || null);
      } else {
        toast.error("Failed to fetch quiz submissions");
      }
    } catch (error) {
      console.error("Error fetching quiz submissions:", error);
      toast.error("An error occurred while fetching quiz submissions");
    } finally {
      setLoadingResults(false);
    }
  };
  
  const fetchSubmissionDetails = async (submissionId: string) => {
    try {
      // For now, we'll use the existing data since we already have the answers
      // In a real implementation, you might want to fetch more detailed data here
      const submission = submissions.find(sub => sub._id === submissionId);
      if (submission) {
        setSelectedSubmission(submission);
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
      toast.error("An error occurred while fetching submission details");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
          toast.success("Quiz deleted successfully");
        } else {
          toast.error("Failed to delete quiz");
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("An error occurred while deleting the quiz");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ninja-crimson"></div>
      </div>
    );
  }

  return (
    <div className="bg-ninja-cream p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ninja-black">Quizzes</h1>
        <Button
          onClick={() => router.push("/teacher/quizzes/create")}
          className="bg-ninja-crimson/90 hover:bg-ninja-crimson/60"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileQuestion className="h-16 w-16 text-ninja-crimson opacity-50 mb-4" />
            <p className="text-lg font-medium text-ninja-black mb-2">
              No Quizzes Found
            </p>
            <p className="text-ninja-black text-center mb-6">
              You haven&apos;t created any quizzes yet. Create your first quiz
              to get started!
            </p>
            <Button
              onClick={() => router.push("/teacher/quizzes/create")}
              className="bg-ninja-crimson hover:bg-ninja-crimson/90"
            >
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="bg-white text-ninja-black shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-ninja-black">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.storyId?.title || "can't get the title"}
                </p>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex items-center text-xs text-ninja-black mb-4">
                  <span className="mr-4">
                    {quiz.questions.length} Questions
                  </span>
                  {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                </div>
                {quiz.storyId && (
                  <p className="text-xs text-ninja-black mb-4">
                    Linked to: {quiz.storyId.title}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teacher/quizzes/${quiz._id}`)}
                    className="text-ninja-crimson border-ninja-crimson hover:bg-ninja-crimson/10 text-xs md:text-sm"
                  >
                    <Edit className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowResults(quiz._id)}
                    className="text-blue-500 border-blue-500 hover:bg-blue-50 text-xs md:text-sm"
                  >
                    <FileQuestion className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden xs:inline">See </span>Results
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-red-500 border-red-500 hover:bg-red-50 text-xs md:text-sm"
                  >
                    <Trash2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-4xl overflow-y-scroll max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Quiz Results: {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              Showing all student submissions for this quiz
            </DialogDescription>
          </DialogHeader>

          {loadingResults ? (
            <div className="flex justify-center py-8">Loading results...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              No submissions found for this quiz
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  {/* <TableHead>Score</TableHead> */}
                  <TableHead>Percentage</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow 
                    key={submission._id} 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setShowSubmissionDetailsModal(true);
                    }}
                  >
                    <TableCell>
                      {submission.student?.firstName +
                        " " +
                        submission.student.lastName || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {submission.student?.email || "Unknown"}
                    </TableCell>
                    {/* <TableCell>{submission.score}</TableCell> */}
                    <TableCell>
                      {submission.percentageScore.toFixed(1)}%
                    </TableCell>
                    {/* <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          submission.passed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submission.passed ? "Passed" : "Failed"}
                      </span>
                    </TableCell> */}
                    <TableCell>
                      {new Date(submission.completedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Details Modal */}
      <Dialog open={showSubmissionDetailsModal} onOpenChange={setShowSubmissionDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && 
                `Student: ${selectedSubmission.student?.firstName} ${selectedSubmission.student?.lastName} • Score: ${selectedSubmission.percentageScore.toFixed(1)}% • Completed: ${new Date(selectedSubmission.completedAt).toLocaleString()}`
              }
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && selectedQuiz && (
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold">Questions and Answers</h3>
              
              {selectedQuiz.questions.map((question, index) => {
                const answer = selectedSubmission.answers?.find(
                  (a) => a.questionId === question._id
                );
                
                return (
                  <div key={question._id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        answer?.isCorrect ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {answer?.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          Question {index + 1}: {question.questionText}
                        </h4>
                        
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded ${
                                answer?.selectedOptionIndex === optIndex
                                  ? option.isCorrect
                                    ? "bg-green-100"
                                    : "bg-red-100"
                                  : option.isCorrect
                                    ? "bg-green-50"
                                    : ""
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="flex-1">{option.text}</div>
                                {option.isCorrect && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                                )}
                                {answer?.selectedOptionIndex === optIndex && !option.isCorrect && (
                                  <XCircle className="h-4 w-4 text-red-600 ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowSubmissionDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="bg-ninja-cream p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ninja-black">Quizzes</h1>
        <Button
          onClick={() => router.push("/teacher/quizzes/create")}
          className="bg-ninja-peach/90 hover:bg-ninja-peach/60"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <FileQuestion className="h-16 w-16 text-ninja-crimson opacity-50 mb-4" />
            <p className="text-lg font-medium text-ninja-black mb-2">
              No Quizzes Found
            </p>
            <p className="text-ninja-black text-center mb-6">
              You haven&apos;t created any quizzes yet. Create your first quiz
              to get started!
            </p>
            <Button
              onClick={() => router.push("/teacher/quizzes/create")}
              className="bg-ninja-crimson hover:bg-ninja-crimson/90"
            >
              Create Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz._id}
              className="bg-white text-ninja-black shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-ninja-black">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.storyId?.title || "can't get the title"}
                </p>
                <p className="text-sm text-ninja-black mb-2 line-clamp-2">
                  {quiz.description}
                </p>
                <div className="flex items-center text-xs text-ninja-black mb-4">
                  <span className="mr-4">
                    {quiz.questions.length} Questions
                  </span>
                  {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                </div>
                {quiz.storyId && (
                  <p className="text-xs text-ninja-black mb-4">
                    Linked to: {quiz.storyId.title}
                  </p>
                )}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/teacher/quizzes/${quiz._id}`)}
                    className="text-ninja-crimson border-ninja-crimson hover:bg-ninja-crimson/10"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowResults(quiz._id)}
                    className="text-blue-500 border-blue-500 hover:bg-blue-50"
                  >
                    <FileQuestion className="mr-2 h-4 w-4" />
                    See Results
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

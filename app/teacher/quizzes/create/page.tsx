"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

type Story = {
  _id: string;
  title: string;
};

type QuestionOption = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  questionText: string;
  options: QuestionOption[];
  points: number;
};

export default function CreateQuiz() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    storyId: "",

    questions: [
      {
        questionText: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        points: 1,
      },
    ],
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/stories");
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      } else {
        toast.error("Failed to fetch stories");
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("An error occurred while fetching stories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setQuizData({ ...quizData, [name]: value });
  };

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    const updatedQuestions = [...quizData.questions];
    // Reset all options to false
    updatedQuestions[questionIndex].options.forEach((option, idx) => {
      option.isCorrect = idx === optionIndex;
    });
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          questionText: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          points: 1,
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: updatedQuestions });
    } else {
      toast.error("Quiz must have at least one question");
    }
  };

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      toast.error("Quiz title is required");
      return false;
    }

    if (!quizData.description.trim()) {
      toast.error("Quiz description is required");
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];

      if (!question.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          toast.error(`Option ${j + 1} for Question ${i + 1} is required`);
          return false;
        }
      }

      if (!question.options.some((option) => option.isCorrect)) {
        toast.error(`Question ${i + 1} must have at least one correct answer`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateQuiz()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...quizData,
        // Format storyId as an ID object if it exists
        storyId: quizData.storyId === "none" ? undefined : { _id: quizData.storyId },
      };

      const response = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Quiz created successfully");
        router.push("/teacher/quizzes");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("An error occurred while creating the quiz");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-ninja-black mt-2">
          Create New Quiz
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white shadow-sm mb-6 text-ninja-black">
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={quizData.title}
                  onChange={handleInputChange}
                  placeholder="Enter quiz title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={quizData.description}
                  onChange={handleInputChange}
                  placeholder="Enter quiz description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="storyId">Link to Story </Label>
                  <Select
                    value={quizData.storyId}
                    onValueChange={(value) =>
                      handleSelectChange("storyId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a story" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {stories.map((story) => (
                        <SelectItem key={story._id.toString()} value={story._id.toString()}>
                          {story.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold text-ninja-black mb-4">
          Questions
        </h2>

        {quizData.questions.map((question, questionIndex) => (
          <Card
            key={questionIndex}
            className="bg-white text-ninja-black shadow-sm mb-6"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-ninja-black">
                  Question {questionIndex + 1}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`question-${questionIndex}`}>
                    Question Text
                  </Label>
                  <Textarea
                    id={`question-${questionIndex}`}
                    value={question.questionText}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "questionText",
                        e.target.value
                      )
                    }
                    placeholder="Enter question text"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Options (Select the correct answer)</Label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`option-${questionIndex}-${optionIndex}`}
                        name={`correct-option-${questionIndex}`}
                        checked={option.isCorrect}
                        onChange={() =>
                          handleCorrectOptionChange(questionIndex, optionIndex)
                        }
                        className="h-4 w-4 text-ninja-crimson"
                      />
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`points-${questionIndex}`}>Points</Label>
                  <Input
                    id={`points-${questionIndex}`}
                    type="number"
                    min="1"
                    max="10"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "points",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="mb-6 border-ninja-crimson text-ninja-crimson hover:bg-ninja-crimson/10"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Question
        </Button>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/teacher/quizzes")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-ninja-crimson hover:bg-ninja-crimson/90"
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Quiz
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

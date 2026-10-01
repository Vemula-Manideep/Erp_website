import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Typography,
  Radio,
  Textarea,
  Alert,
  Progress,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
} from "@material-tailwind/react";
import {
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import {
  getActiveAttempt,
  getExamDetails,
  getExamQuestions,
  saveAnswer,
  submitExam,
  getExamResult,
} from "@/API/ExamApi";

/**
 * StudentExamAttempt Component
 *
 * Full-screen exam interface for students to take exams
 * Features:
 * - Backend-based timer (prevents clock manipulation)
 * - Question navigation
 * - Answer saving
 * - Auto-submit on timeout
 * - State recovery on refresh
 */
export function StudentExamAttempt({ attemptId }) {
  // State Management
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { selectedOptionId/descriptiveAnswer } }
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerIntervalRef = useRef(null);

  const studentId = localStorage.getItem("studentId");
  const actualAttemptId = attemptId || localStorage.getItem("currentExamAttemptId");

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (actualAttemptId && studentId) {
      initializeExam();
    }
  }, [actualAttemptId, studentId]);

  const initializeExam = async () => {
    try {
      setLoading(true);

      // Fetch current attempt (with state recovery)
      const attemptData = await getActiveAttempt(null, studentId);
      if (attemptData.examId) {
        setAttempt(attemptData);

        // Fetch exam details
        const examData = await getExamDetails(attemptData.examId);
        setExam(examData);

        // Fetch questions
        const questionsData = await getExamQuestions(attemptData.examId);
        setQuestions(questionsData);

        // Restore saved answers
        if (attemptData.savedAnswers) {
          setAnswers(attemptData.savedAnswers);
        }

        // Calculate remaining time (backend-based)
        calculateRemainingTime(examData, attemptData);
      }
    } catch (error) {
      console.error("Error initializing exam:", error);
      alert("Failed to load exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ===== TIMER LOGIC (BACKEND-BASED) =====
  const calculateRemainingTime = (examData, attemptData) => {
    const startTime = new Date(attemptData.startedAt).getTime();
    const durationMs = examData.duration * 60 * 1000;
    const endTime = startTime + durationMs;
    const currentTime = new Date().getTime();
    const remaining = Math.max(0, endTime - currentTime);

    setTimeRemaining(remaining);

    // Start timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1000);

        if (newTime === 0) {
          // Auto-submit on timeout
          handleAutoSubmit(examData, attemptData);
        }

        return newTime;
      });
    }, 1000);
  };

  // Auto-submit exam
  const handleAutoSubmit = async (examData, attemptData) => {
    try {
      clearInterval(timerIntervalRef.current);
      const resultData = await submitExam(attemptData.id);
      setResult(resultData);
      setSubmitted(true);

      alert("⏰ Time's up! Your exam has been auto-submitted.");
    } catch (error) {
      console.error("Error auto-submitting:", error);
    }
  };

  // ===== ANSWER HANDLING =====
  const handleAnswerChange = (questionId, value, isDescriptive = false) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [isDescriptive ? "descriptiveAnswer" : "selectedOptionId"]: value,
      },
    }));

    // Auto-save answer
    if (attempt) {
      saveAnswerToBackend(attempt.id, questionId, value, isDescriptive);
    }
  };

  const saveAnswerToBackend = async (
    studentExamId,
    questionId,
    value,
    isDescriptive
  ) => {
    try {
      await saveAnswer(studentExamId, questionId, {
        selectedOptionId: isDescriptive ? null : value,
        descriptiveAnswer: isDescriptive ? value : null,
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  // ===== QUESTION NAVIGATION =====
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // ===== SUBMIT EXAM =====
  const handleSubmitExam = async () => {
    if (!confirm("Are you sure? You cannot undo this action.")) return;

    try {
      clearInterval(timerIntervalRef.current);
      const resultData = await submitExam(attempt.id);
      setResult(resultData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam");
    }
  };

  // ===== HELPER FUNCTIONS =====
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    return answer && (answer.selectedOptionId || answer.descriptiveAnswer);
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="p-8">
          <Typography>Loading exam...</Typography>
        </Card>
      </div>
    );
  }

  // ===== SUBMITTED STATE =====
  if (submitted && result) {
    return <ExamResultScreen result={result} exam={exam} />;
  }

  // ===== MAIN EXAM SCREEN =====
  if (!exam || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="p-8 text-center">
          <Typography color="red">Error loading exam</Typography>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const totalQuestions = questions.length;
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* FULLSCREEN WARNING */}
      <Alert color="blue" className="mb-4 flex items-center gap-2">
        <CheckIcon className="h-4 w-4" />
        <Typography variant="small">
          📌 Exam in progress. Do not refresh or switch tabs.
        </Typography>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* MAIN EXAM PANEL */}
        <div className="lg:col-span-3 space-y-4">
          {/* EXAM HEADER */}
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <Typography variant="h5" color="blue-gray">
                  {exam.title}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {exam.subject}
                </Typography>
              </div>

              {/* TIMER */}
              <div className={`text-center p-4 rounded-lg ${
                timeRemaining < 60000 ? "bg-red-50" : "bg-blue-50"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <ClockIcon className={`h-6 w-6 ${
                    timeRemaining < 60000 ? "text-red-600" : "text-blue-600"
                  }`} />
                  <Typography
                    className={`text-2xl font-bold ${
                      timeRemaining < 60000 ? "text-red-600" : "text-blue-600"
                    }`}
                  >
                    {formatTime(timeRemaining || 0)}
                  </Typography>
                </div>
                {timeRemaining < 60000 && (
                  <Typography variant="tiny" className="text-red-600 mt-1">
                    ⚠️ Less than 1 min!
                  </Typography>
                )}
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="small">
                  Question {questionNumber} of {totalQuestions}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Answered: {getAnsweredCount()}/{totalQuestions}
                </Typography>
              </div>
              <Progress
                value={progress}
                className="bg-blue-100"
                barProps={{ className: "bg-blue-600" }}
              />
            </div>
          </Card>

          {/* QUESTION CARD */}
          <Card>
            <CardBody className="space-y-4">
              {/* QUESTION TEXT */}
              <div>
                <Typography variant="h6" color="blue-gray">
                  Question {questionNumber}
                </Typography>
                <Typography className="mt-2 text-lg leading-relaxed">
                  {currentQuestion.questionText}
                </Typography>
                <Chip
                  value={`${currentQuestion.marks} mark${
                    currentQuestion.marks > 1 ? "s" : ""
                  }`}
                  size="sm"
                  className="mt-2"
                  color="amber"
                />
              </div>

              {/* QUESTION CONTENT */}
              {currentQuestion.type === "MCQ" ? (
                <div className="space-y-2 mt-4">
                  <Typography variant="small" className="font-semibold">
                    Choose the correct option:
                  </Typography>
                  {currentQuestion.options?.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      style={{
                        borderColor:
                          answers[currentQuestion.id]?.selectedOptionId ===
                          option.id
                            ? "#1e40af"
                            : "#e5e7eb",
                      }}
                    >
                      <Radio
                        name={`question-${currentQuestion.id}`}
                        checked={
                          answers[currentQuestion.id]?.selectedOptionId ===
                          option.id
                        }
                        onChange={() =>
                          handleAnswerChange(currentQuestion.id, option.id)
                        }
                        containerProps={{ className: "mr-3" }}
                      />
                      <Typography>{option.optionText}</Typography>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <Typography variant="small" className="font-semibold mb-2">
                    Your Answer:
                  </Typography>
                  <Textarea
                    value={
                      answers[currentQuestion.id]?.descriptiveAnswer || ""
                    }
                    onChange={(e) =>
                      handleAnswerChange(
                        currentQuestion.id,
                        e.target.value,
                        true
                      )
                    }
                    label="Type your answer here..."
                    rows={6}
                    containerProps={{ className: "w-full" }}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between gap-2">
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitExam}
            >
              📤 Submit Exam
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* SIDEBAR - QUESTION NAVIGATOR */}
        <div>
          <Card>
            <CardBody className="p-3">
              <Typography variant="h6" className="mb-3">
                Questions Navigator
              </Typography>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`aspect-square rounded font-semibold text-sm transition-all ${
                      idx === currentQuestionIndex
                        ? "bg-blue-600 text-white scale-110"
                        : isQuestionAnswered(q.id)
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* LEGEND */}
              <div className="space-y-2 mt-4 border-t pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <Typography variant="tiny">Current</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-700 rounded"></div>
                  <Typography variant="tiny">Answered</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-700 rounded"></div>
                  <Typography variant="tiny">Not Answered</Typography>
                </div>
              </div>

              {/* EXAM INFO */}
              <div className="mt-4 border-t pt-3 space-y-1">
                <Typography variant="tiny" className="font-semibold">
                  📊 Exam Info
                </Typography>
                <Typography variant="tiny" className="text-gray-600">
                  Total Questions: {totalQuestions}
                </Typography>
                <Typography variant="tiny" className="text-gray-600">
                  Total Marks: {exam.totalMarks}
                </Typography>
                <Typography variant="tiny" className="text-gray-600">
                  Negative Marks: {exam.negativeMark || 0}
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* EXIT CONFIRMATION DIALOG */}
      <Dialog open={showExitConfirm} handler={() => setShowExitConfirm(false)}>
        <DialogHeader>Exit Exam?</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to exit? Your progress will be saved, but you
            cannot return to this attempt.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outlined"
            onClick={() => setShowExitConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              clearInterval(timerIntervalRef.current);
              window.history.back();
            }}
          >
            Exit
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

/**
 * ExamResultScreen Component
 *
 * Display exam result after submission
 */
function ExamResultScreen({ result, exam }) {
  const scorePercentage = (result.totalScore / exam.totalMarks) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardBody className="text-center space-y-6">
          {/* SUCCESS ICON */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* TITLE */}
          <Typography variant="h3" color="green">
            ✅ Exam Submitted Successfully!
          </Typography>

          {/* EXAM TITLE */}
          <Typography variant="h6" color="blue-gray">
            {exam?.title}
          </Typography>

          {/* SCORE SECTION */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <Typography variant="h5" className="mb-4">
              Your Score
            </Typography>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <Typography variant="small" className="text-gray-600 mb-2">
                  Total Score
                </Typography>
                <Typography variant="h4" color="blue">
                  {result.totalScore}/{exam?.totalMarks}
                </Typography>
              </div>

              <div className="bg-white p-4 rounded-lg text-center">
                <Typography variant="small" className="text-gray-600 mb-2">
                  Percentage
                </Typography>
                <Typography
                  variant="h4"
                  color={scorePercentage >= 40 ? "green" : "red"}
                >
                  {scorePercentage.toFixed(2)}%
                </Typography>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <Progress value={Math.min(scorePercentage, 100)} />
          </Card>

          {/* DETAILS */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Typography variant="small" className="text-gray-600">
                Questions
              </Typography>
              <Typography variant="h6">{result.totalQuestions || 0}</Typography>
            </div>
            <div>
              <Typography variant="small" className="text-gray-600">
                Correct Answers
              </Typography>
              <Typography variant="h6" color="green">
                {result.correctAnswers || 0}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="text-gray-600">
                Wrong Answers
              </Typography>
              <Typography variant="h6" color="red">
                {result.wrongAnswers || 0}
              </Typography>
            </div>
          </div>

          {/* STATUS MESSAGE */}
          {scorePercentage >= 40 ? (
            <Alert color="green" className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4" />
              <Typography variant="small">🎉 Congratulations! You passed!</Typography>
            </Alert>
          ) : (
            <Alert color="red" className="flex items-center gap-2">
              <XMarkIcon className="h-4 w-4" />
              <Typography variant="small">
                Better luck next time. Keep practicing!
              </Typography>
            </Alert>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outlined"
              className="flex-1"
              onClick={() => (window.location.href = "/student/home")}
            >
              Back to Dashboard
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => (window.location.href = "/student/exams")}
            >
              View More Exams
            </Button>
          </div>

          {/* SUBMISSION TIME */}
          <Typography variant="tiny" className="text-gray-500 mt-4">
            📅 Submitted at:{" "}
            {new Date(result.submittedAt).toLocaleString()}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

export default StudentExamAttempt;

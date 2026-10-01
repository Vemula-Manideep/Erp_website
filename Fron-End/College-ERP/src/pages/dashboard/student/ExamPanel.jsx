import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Progress,
  Chip,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import axiosInstance from "utils/axiosInstance";

/**
 * ExamPanel Component
 * 
 * Secure Proctored Examination Module with:
 * - Fullscreen enforcement
 * - Real-time violation detection
 * - WebSocket-based alerts
 * - State recovery on refresh
 */
export function ExamPanel() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user } = useAuth();

  // Authentication & Data
  const studentId = user?.id;
  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");

  // State Management
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examActive, setExamActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examTerminated, setExamTerminated] = useState(false);

  // Refs for WebSocket and tracking
  const ws = useRef(null);
  const timerInterval = useRef(null);
  const violationCountRef = useRef(0);
  const examStartTimeRef = useRef(null);
  const VIOLATION_THRESHOLD = 5;

  // ===== INITIALIZATION =====
  useEffect(() => {
    const initializeExam = async () => {
      if (!studentId) return;
      try {
        // Fetch exam data with state recovery
        const response = await axiosInstance.get(
          `/api/exams/${examId}/student/${studentId}`
        );

        const data = response.data;
        setExamData(data);
        setTimeRemaining(data.remainingTime || data.durationMinutes * 60);
        examStartTimeRef.current = data.examStartTime || Date.now();

        // Restore previous state if refresh
        if (data.savedAnswers) {
          setAnswers(data.savedAnswers);
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        }

        if (data.violationCount) {
          setViolationCount(data.violationCount);
          violationCountRef.current = data.violationCount;
        }

        setLoading(false);
      } catch (error) {
        console.error("Exam initialization error:", error);
        setLoading(false);
      }
    };

    initializeExam();
  }, [examId, studentId]);

  // ===== WEBSOCKET CONNECTION =====
  useEffect(() => {
    if (!examData || !studentId) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//localhost:8080/ws`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("✅ WebSocket connected");
        // Subscribe to exam channel
        ws.current.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            topic: `exam-${examId}-student-${studentId}`,
          })
        );
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "EXAM_TERMINATED") {
            setExamTerminated(true);
            setExamActive(false);
            setWarningMessage(
              "Your exam has been terminated due to violations."
            );
            setShowWarning(true);
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("⚠️ WebSocket disconnected");
        // Attempt reconnection
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [examData, studentId, examId]);

  // ===== TIMER LOGIC =====
  useEffect(() => {
    if (!examActive || timeRemaining <= 0) return;

    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setExamActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval.current);
  }, [examActive, timeRemaining]);

  // ===== FULLSCREEN ENFORCEMENT =====
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.warn("Fullscreen not available:", error);
      }
    };

    if (examActive && examData) {
      enterFullscreen();
    }
  }, [examActive, examData]);

  // ===== VIOLATION DETECTION =====

  // Detect fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        reportViolation("FULLSCREEN_EXIT", "critical");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  // Detect tab/window blur
  useEffect(() => {
    const handleBlur = () => {
      if (examActive) {
        reportViolation("WINDOW_BLUR", "high");
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [examActive]);

  // Detect visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examActive) {
        reportViolation("TAB_SWITCH", "high");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examActive]);

  // Detect devtools shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!examActive) return;

      // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J"))
      ) {
        e.preventDefault();
        reportViolation("DEVTOOLS_DETECTED", "critical");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [examActive]);

  // Disable right-click, copy, paste
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (examActive) {
        e.preventDefault();
        reportViolation("RIGHT_CLICK", "medium");
      }
    };

    const handleCopy = (e) => {
      if (examActive) {
        e.preventDefault();
        reportViolation("COPY_ATTEMPT", "medium");
      }
    };

    const handlePaste = (e) => {
      if (examActive) {
        e.preventDefault();
        reportViolation("PASTE_ATTEMPT", "medium");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [examActive]);

  // ===== VIOLATION REPORTING =====
  const reportViolation = useCallback(
    (violationType, severity) => {
      if (!examActive || violationCountRef.current >= VIOLATION_THRESHOLD) {
        return;
      }

      const newViolation = {
        id: Date.now(),
        type: violationType,
        severity,
        timestamp: new Date().toISOString(),
      };

      violationCountRef.current += 1;
      setViolationCount(violationCountRef.current);
      setViolations((prev) => [...prev, newViolation]);

      // Show warning
      setWarningMessage(`⚠️ ${violationType.replace(/_/g, " ")} detected!`);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);

      // Send via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "REPORT_VIOLATION",
            examId,
            studentId,
            violationType,
            severity,
            timestamp: new Date().toISOString(),
          })
        );
      }

      // Auto-save state
      saveExamState();

      // Check threshold
      if (violationCountRef.current >= VIOLATION_THRESHOLD) {
        setExamActive(false);
        setExamTerminated(true);
        setWarningMessage("Exam terminated due to multiple violations!");
        setShowWarning(true);
      }
    },
    [examActive, examId, studentId]
  );

  // ===== STATE PERSISTENCE =====
  const saveExamState = async () => {
    try {
      await axiosInstance.put(
        `/api/exams/${examId}/student/${studentId}/state`,
        {
          answers,
          currentQuestionIndex,
          violationCount: violationCountRef.current,
          violations,
          savedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Failed to save exam state:", error);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!examActive) return;

    const autoSaveInterval = setInterval(saveExamState, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [answers, currentQuestionIndex, violationCount, violations, examActive]);

  // ===== ANSWER HANDLING =====
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // ===== EXAM SUBMISSION =====
  const handleSubmitExam = async () => {
    try {
      const response = await axiosInstance.post(
        `/api/exams/${examId}/student/${studentId}/submit`,
        {
          answers,
          violations,
          completedAt: new Date().toISOString(),
        }
      );

      if (response.status === 200 || response.status === 201) {
        setExamActive(false);
        navigate("/dashboard/student/home");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // ===== FORMATTING =====
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Typography>Loading exam...</Typography>
      </div>
    );
  }

  if (!examData) {
    return (
      <Card className="p-6">
        <Alert color="red">Exam not found</Alert>
      </Card>
    );
  }

  const currentQuestion =
    examData.questions && examData.questions[currentQuestionIndex];
  const progressPercent =
    examData.questions &&
    ((currentQuestionIndex + 1) / examData.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER - Exam Info Bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShieldCheckIcon className="h-6 w-6 text-green-400" />
            <Typography color="white" variant="h6">
              {examData.title || "Proctored Exam"}
            </Typography>
          </div>

          {/* TIMER */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300
              ? "bg-red-500/20 border border-red-500"
              : "bg-slate-700"
              }`}>
              <ClockIcon className="h-5 w-5 text-white" />
              <Typography
                color="white"
                className={timeRemaining < 300 ? "text-red-400" : ""}
              >
                {formatTime(timeRemaining)}
              </Typography>
            </div>

            {/* VIOLATIONS */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700">
              <ExclamationTriangleIcon
                className={`h-5 w-5 ${violationCount >= VIOLATION_THRESHOLD
                  ? "text-red-500"
                  : violationCount >= 3
                    ? "text-yellow-400"
                    : "text-green-400"
                  }`}
              />
              <Typography color="white">
                Violations: {violationCount}/{VIOLATION_THRESHOLD}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* WARNING ALERTS */}
          {showWarning && (
            <Alert
              color="red"
              className="mb-4 animate-pulse border-l-4 border-red-500"
            >
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <Typography color="white">{warningMessage}</Typography>
              </div>
            </Alert>
          )}

          {examTerminated && (
            <Card className="mb-6 bg-red-50 border-2 border-red-500 p-6">
              <div className="flex items-center gap-3 mb-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <Typography variant="h6" color="red">
                  Exam Terminated
                </Typography>
              </div>
              <Typography color="red">
                Your exam has been terminated due to multiple violations. Please
                contact your instructor.
              </Typography>
            </Card>
          )}

          {/* PROGRESS */}
          <Card className="mb-6 p-6 bg-slate-800 border border-slate-700">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Typography color="white">
                  Question {currentQuestionIndex + 1} of{" "}
                  {examData.questions?.length || 0}
                </Typography>
                <Chip
                  value={`${Math.round(progressPercent)}%`}
                  color="blue"
                />
              </div>
              <Progress
                value={progressPercent}
                className="bg-slate-700"
                barProps={{ className: "bg-gradient-to-r from-blue-400 to-blue-600" }}
              />
            </div>
          </Card>

          {/* QUESTION CARD */}
          {currentQuestion && (
            <Card className="mb-6 p-8 bg-white shadow-2xl">
              <Typography variant="h5" className="mb-6 text-slate-900">
                {currentQuestion.text}
              </Typography>

              {/* MULTIPLE CHOICE OPTIONS */}
              {currentQuestion.type === "MCQ" && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        id={`option-${idx}`}
                        value={option}
                        checked={
                          answers[currentQuestion.id] === option
                        }
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        disabled={!examActive}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label
                        htmlFor={`option-${idx}`}
                        className="ml-3 text-sm font-medium text-slate-700 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* SHORT ANSWER */}
              {currentQuestion.type === "SHORT_ANSWER" && (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  disabled={!examActive}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  rows="6"
                />
              )}

              {/* STATUS BADGE */}
              <div className="mt-6 flex items-center gap-2">
                {answers[currentQuestion.id] ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <Typography className="text-sm text-green-600">
                      Answered
                    </Typography>
                  </>
                ) : (
                  <Typography className="text-sm text-slate-400">
                    Not answered
                  </Typography>
                )}
              </div>
            </Card>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || !examActive}
              className="bg-slate-700 text-white"
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {currentQuestionIndex === examData.questions?.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={!examActive || examTerminated}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!examActive}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EXAM TERMINATION DIALOG */}
      <Dialog open={examTerminated} handler={() => { }}>
        <DialogHeader>Exam Terminated</DialogHeader>
        <DialogBody>
          <Typography>
            Your exam has been terminated due to{" "}
            <strong>{violationCount} violations</strong> detected during the
            exam. Please contact your instructor.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => navigate("/dashboard/student/home")}
            className="bg-blue-600"
          >
            Return to Dashboard
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ExamPanel;

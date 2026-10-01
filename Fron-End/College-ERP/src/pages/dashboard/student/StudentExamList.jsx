import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { CheckCircleIcon, ClockIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import {
  getAvailableExams,
  getStudentExamAttempts,
  startExamAttempt,
} from "@/API/ExamApi";

import { useAuth } from "../../../../context/AuthContext";

/**
 * StudentExamList Component
 *
 * Shows available exams that students can take
 * Displays exam status, attempts remaining, and eligibility
 */
export function StudentExamList({ onExamStart }) {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [starting, setStarting] = useState(false);

  const studentId = user?.id;

  useEffect(() => {
    if (studentId) {
      loadAvailableExams();
      loadAttempts();
    }
  }, [studentId]);

  const loadAvailableExams = async () => {
    try {
      setLoading(true);
      const data = await getAvailableExams(studentId);
      setExams(data);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      const data = await getStudentExamAttempts(studentId);
      setAttempts(data);
    } catch (error) {
      console.error("Error loading attempts:", error);
    }
  };

  // Count attempts for an exam
  const getAttemptCount = (examId) => {
    return attempts.filter((a) => a.examId === examId).length;
  };

  // Check if exam is within time window
  const isExamAvailable = (exam) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);
    return now >= start && now <= end;
  };

  // Check if student can attempt
  const canAttempt = (exam) => {
    const attemptCount = getAttemptCount(exam.id);
    const available = isExamAvailable(exam);
    const attemptsLeft = exam.maxAttempts - attemptCount;

    return available && attemptsLeft > 0;
  };

  // Start exam attempt
  const handleStartExam = async () => {
    if (!selectedExam) return;

    try {
      setStarting(true);
      const attempt = await startExamAttempt(selectedExam.id, studentId);
      setShowConfirmDialog(false);

      // Pass to parent component or navigate
      if (onExamStart) {
        onExamStart(attempt);
      } else {
        // Store attempt ID and navigate
        localStorage.setItem("currentExamAttemptId", attempt.id);
        window.location.href = `/student/exam-attempt/${attempt.id}`;
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      alert("Failed to start exam. " + (error.message || ""));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <BookOpenIcon className="h-8 w-8 text-blue-600" />
        <Typography variant="h4" color="blue-gray">
          📚 Available Exams
        </Typography>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <Card className="p-6">
          <Typography>Loading exams...</Typography>
        </Card>
      ) : exams.length === 0 ? (
        <Card className="p-6 text-center">
          <Typography color="blue-gray">
            No exams available at this time.
          </Typography>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const attemptCount = getAttemptCount(exam.id);
            const available = isExamAvailable(exam);
            const canAttemptExam = canAttempt(exam);
            const attemptsLeft = exam.maxAttempts - attemptCount;

            return (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="space-y-3">
                  {/* Title */}
                  <Typography variant="h6" color="blue-gray">
                    {exam.title}
                  </Typography>

                  {/* Subject */}
                  <Typography variant="small" className="text-gray-600">
                    📖 Subject: {exam.subject}
                  </Typography>

                  {/* Exam Details */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <Typography variant="tiny" className="text-gray-600">
                        Duration
                      </Typography>
                      <Typography variant="small" className="font-semibold">
                        {exam.duration} mins
                      </Typography>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <Typography variant="tiny" className="text-gray-600">
                        Total Marks
                      </Typography>
                      <Typography variant="small" className="font-semibold">
                        {exam.totalMarks}
                      </Typography>
                    </div>
                  </div>

                  {/* Questions Count */}
                  <div className="flex items-center justify-between">
                    <Typography variant="small">Questions:</Typography>
                    <Chip
                      value={exam.questionCount || 0}
                      size="sm"
                      color="cyan"
                    />
                  </div>

                  {/* Attempts Status */}
                  <div className="flex items-center justify-between">
                    <Typography variant="small">Attempts:</Typography>
                    <Chip
                      value={`${attemptCount}/${exam.maxAttempts}`}
                      size="sm"
                      color={attemptsLeft > 0 ? "green" : "red"}
                    />
                  </div>

                  {/* Time Window */}
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-gray-600">
                      {available ? (
                        <span className="text-green-600 font-semibold">
                          Exam is LIVE
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          Exam: {new Date(exam.startTime).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Status Alert */}
                  {!available && (
                    <Alert color="amber" className="flex items-center gap-2">
                      <Typography variant="small">
                        Not available yet
                      </Typography>
                    </Alert>
                  )}

                  {attemptsLeft === 0 && (
                    <Alert color="red" className="flex items-center gap-2">
                      <Typography variant="small">
                        No attempts remaining
                      </Typography>
                    </Alert>
                  )}

                  {/* Action Button */}
                  <Button
                    className={`w-full mt-3 ${
                      canAttemptExam
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowConfirmDialog(true);
                    }}
                    disabled={!canAttemptExam}
                  >
                    {canAttemptExam ? "Start Exam" : "Not Available"}
                  </Button>

                  {/* Previous Attempts Info */}
                  {attemptCount > 0 && (
                    <Typography
                      variant="tiny"
                      className="text-gray-500 text-center mt-2"
                    >
                      ✓ You have already attempted {attemptCount} time
                      {attemptCount > 1 ? "s" : ""}
                    </Typography>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* CONFIRM START DIALOG */}
      <Dialog open={showConfirmDialog} handler={() => setShowConfirmDialog(false)}>
        <DialogHeader>Start Exam</DialogHeader>
        <DialogBody>
          {selectedExam && (
            <div className="space-y-3">
              <Typography className="font-semibold">
                {selectedExam.title}
              </Typography>
              <Typography variant="small" color="blue-gray">
                ⏱️ Duration: {selectedExam.duration} minutes
              </Typography>
              <Typography variant="small" color="blue-gray">
                ❓ Questions: {selectedExam.questionCount || 0}
              </Typography>
              <Typography variant="small" color="blue-gray">
                ⭐ Total Marks: {selectedExam.totalMarks}
              </Typography>

              <Alert color="blue" className="mt-4">
                <Typography variant="small">
                  📌 <strong>Important:</strong> Once you start, you cannot
                  pause. Make sure you have a stable internet connection and
                  sufficient time to complete the exam.
                </Typography>
              </Alert>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outlined"
            onClick={() => setShowConfirmDialog(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600"
            onClick={handleStartExam}
            disabled={starting}
          >
            {starting ? "Starting..." : "Start Now"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default StudentExamList;

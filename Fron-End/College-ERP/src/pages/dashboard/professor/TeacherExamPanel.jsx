import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tab,
  Tabs,
  TabsHeader,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import {
  createExam,
  getTeacherExams,
  updateExam,
  deleteExam,
  publishExam,
  getExamQuestions,
} from "@/API/ExamApi";

/**
 * TeacherExamPanel Component
 *
 * Allows professors to:
 * - Create and manage exams
 * - Add questions to exams
 * - Publish exams
 * - View exam statistics
 */
export function TeacherExamPanel() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("draft");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    duration: 60,
    totalMarks: 100,
    negativeMark: 0,
    maxAttempts: 1,
    startTime: "",
    endTime: "",
  });

  const professorId = localStorage.getItem("professorId");

  // Fetch exams on component load
  useEffect(() => {
    if (professorId) {
      loadExams();
    }
  }, [professorId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await getTeacherExams(professorId);
      setExams(data);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== CREATE EXAM =====
  const handleCreateExam = async () => {
    if (!formData.title || !formData.subject) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const newExam = await createExam({
        ...formData,
        teacherId: professorId,
        status: "DRAFT",
      });

      setExams([...exams, newExam]);
      resetForm();
      setShowCreateDialog(false);
      alert("Exam created successfully!");
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam");
    }
  };

  // ===== UPDATE EXAM =====
  const handleUpdateExam = async (examId) => {
    try {
      const updated = await updateExam(examId, formData);
      setExams(exams.map((e) => (e.id === examId ? updated : e)));
      resetForm();
      setShowCreateDialog(false);
      alert("Exam updated successfully!");
    } catch (error) {
      console.error("Error updating exam:", error);
      alert("Failed to update exam");
    }
  };

  // ===== DELETE EXAM =====
  const handleDeleteExam = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      await deleteExam(examId);
      setExams(exams.filter((e) => e.id !== examId));
      alert("Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert("Failed to delete exam");
    }
  };

  // ===== PUBLISH EXAM =====
  const handlePublishExam = async (examId) => {
    if (!confirm("Are you sure you want to publish this exam?")) return;

    try {
      const updated = await publishExam(examId);
      setExams(exams.map((e) => (e.id === examId ? updated : e)));
      alert("Exam published successfully!");
    } catch (error) {
      console.error("Error publishing exam:", error);
      alert("Failed to publish exam");
    }
  };

  // ===== OPEN CREATE/EDIT DIALOG =====
  const openCreateDialog = () => {
    resetForm();
    setSelectedExam(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (exam) => {
    setFormData({
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      negativeMark: exam.negativeMark || 0,
      maxAttempts: exam.maxAttempts || 1,
      startTime: exam.startTime || "",
      endTime: exam.endTime || "",
    });
    setSelectedExam(exam);
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      duration: 60,
      totalMarks: 100,
      negativeMark: 0,
      maxAttempts: 1,
      startTime: "",
      endTime: "",
    });
  };

  // ===== FILTER EXAMS BY STATUS =====
  const filteredExams = exams.filter((exam) => {
    if (activeTab === "draft") return exam.status === "DRAFT";
    if (activeTab === "published") return exam.status === "PUBLISHED";
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Typography variant="h4" color="blue-gray">
          📝 Exam Management
        </Typography>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={openCreateDialog}
        >
          <PlusIcon className="h-5 w-5" />
          Create Exam
        </Button>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsHeader className="bg-transparent">
          <Tab value="draft" className="px-4">
            🔨 Draft ({exams.filter((e) => e.status === "DRAFT").length})
          </Tab>
          <Tab value="published" className="px-4">
            ✅ Published ({exams.filter((e) => e.status === "PUBLISHED").length})
          </Tab>
        </TabsHeader>
      </Tabs>

      {/* EXAMS TABLE */}
      {loading ? (
        <Card className="p-6">
          <Typography>Loading exams...</Typography>
        </Card>
      ) : filteredExams.length === 0 ? (
        <Card className="p-6 text-center">
          <Typography color="blue-gray">
            {activeTab === "draft"
              ? "No draft exams. Create one to get started!"
              : "No published exams yet."}
          </Typography>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHead className="bg-blue-50">
                <TableRow>
                  <TableCell className="font-bold">Exam Title</TableCell>
                  <TableCell className="font-bold">Subject</TableCell>
                  <TableCell className="font-bold">Duration (min)</TableCell>
                  <TableCell className="font-bold">Total Marks</TableCell>
                  <TableCell className="font-bold">Questions</TableCell>
                  <TableCell className="font-bold">Status</TableCell>
                  <TableCell className="font-bold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-blue-50">
                    <TableCell>
                      <Typography variant="small" color="blue-gray">
                        {exam.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="small">{exam.subject}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="small">{exam.duration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="small">{exam.totalMarks}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        value={exam.questionCount || 0}
                        color="cyan"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        value={exam.status}
                        color={exam.status === "DRAFT" ? "amber" : "green"}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditDialog(exam)}
                          className="p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5 text-blue-600" />
                        </button>

                        {/* Questions Button */}
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowQuestionsDialog(true);
                          }}
                          className="p-1 hover:bg-blue-50 rounded"
                          title="Manage Questions"
                        >
                          <EyeIcon className="h-5 w-5 text-green-600" />
                        </button>

                        {/* Publish Button */}
                        {exam.status === "DRAFT" && (
                          <button
                            onClick={() => handlePublishExam(exam.id)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="Publish"
                          >
                            <CheckIcon className="h-5 w-5 text-green-600" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* CREATE/EDIT EXAM DIALOG */}
      <Dialog
        open={showCreateDialog}
        handler={() => setShowCreateDialog(false)}
        size="lg"
      >
        <DialogHeader>
          {selectedExam ? "Edit Exam" : "Create New Exam"}
        </DialogHeader>
        <DialogBody className="space-y-4 max-h-96 overflow-y-auto">
          {/* Title */}
          <Input
            label="Exam Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Subject */}
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Duration */}
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Total Marks */}
          <Input
            label="Total Marks"
            type="number"
            value={formData.totalMarks}
            onChange={(e) =>
              setFormData({ ...formData, totalMarks: parseInt(e.target.value) })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Negative Mark */}
          <Input
            label="Negative Marking per Wrong Answer"
            type="number"
            step="0.25"
            value={formData.negativeMark}
            onChange={(e) =>
              setFormData({ ...formData, negativeMark: parseFloat(e.target.value) })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Max Attempts */}
          <Input
            label="Maximum Attempts"
            type="number"
            value={formData.maxAttempts}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxAttempts: parseInt(e.target.value),
              })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* Start Time */}
          <Input
            label="Start Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            containerProps={{ className: "mb-4" }}
          />

          {/* End Time */}
          <Input
            label="End Time"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            containerProps={{ className: "mb-4" }}
          />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="outlined"
            color="gray"
            onClick={() => setShowCreateDialog(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600"
            onClick={() => {
              if (selectedExam) {
                handleUpdateExam(selectedExam.id);
              } else {
                handleCreateExam();
              }
            }}
          >
            {selectedExam ? "Update Exam" : "Create Exam"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* QUESTIONS MANAGEMENT DIALOG */}
      {selectedExam && (
        <TeacherQuestionBuilder
          exam={selectedExam}
          open={showQuestionsDialog}
          onClose={() => setShowQuestionsDialog(false)}
          onQuestionAdded={() => {
            loadExams();
          }}
        />
      )}
    </div>
  );
}

/**
 * TeacherQuestionBuilder Component
 *
 * Allows teachers to add/edit questions for an exam
 */
function TeacherQuestionBuilder({ exam, open, onClose, onQuestionAdded }) {
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && exam?.id) {
      loadQuestions();
    }
  }, [open, exam?.id]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getExamQuestions(exam.id);
      setQuestions(data);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader>Manage Questions - {exam?.title}</DialogHeader>
      <DialogBody className="max-h-96 overflow-y-auto space-y-4">
        {loading ? (
          <Typography>Loading questions...</Typography>
        ) : questions.length === 0 ? (
          <Typography color="blue-gray">
            No questions added yet. Click "Add Question" to get started.
          </Typography>
        ) : (
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <Card key={q.id} className="p-3 bg-blue-50">
                <Typography variant="small" className="font-semibold">
                  Q{idx + 1}. {q.questionText}
                </Typography>
                <Chip
                  value={q.type}
                  size="sm"
                  className="mt-2"
                  color={q.type === "MCQ" ? "blue" : "green"}
                />
              </Card>
            ))}
          </div>
        )}

        {showAddQuestion && (
          <QuestionForm
            examId={exam.id}
            onQuestionAdded={() => {
              loadQuestions();
              setShowAddQuestion(false);
              onQuestionAdded();
            }}
            onCancel={() => setShowAddQuestion(false)}
          />
        )}
      </DialogBody>
      <DialogFooter>
        {!showAddQuestion && (
          <Button
            className="bg-blue-600"
            onClick={() => setShowAddQuestion(true)}
          >
            Add Question
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/**
 * QuestionForm Component
 *
 * Form to add new questions
 */
function QuestionForm({ examId, onQuestionAdded, onCancel }) {
  const [questionType, setQuestionType] = useState("MCQ");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [marks, setMarks] = useState(1);

  const { addQuestion } = require("@/API/ExamApi");

  const handleAddQuestion = async () => {
    if (!questionText) {
      alert("Please enter question text");
      return;
    }

    if (questionType === "MCQ" && options.some((o) => !o)) {
      alert("Please fill all options");
      return;
    }

    try {
      await addQuestion(examId, {
        questionText,
        type: questionType,
        marks,
        options:
          questionType === "MCQ"
            ? options.map((opt, idx) => ({
                optionText: opt,
                isCorrect: idx === correctOptionIndex,
              }))
            : [],
      });

      alert("Question added successfully!");
      onQuestionAdded();
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question");
    }
  };

  return (
    <Card className="p-4 bg-gray-50">
      <Typography variant="h6" className="mb-4">
        Add New Question
      </Typography>

      {/* Question Type */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Question Type</label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="MCQ"
              checked={questionType === "MCQ"}
              onChange={(e) => setQuestionType(e.target.value)}
              className="mr-2"
            />
            Multiple Choice
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="DESCRIPTIVE"
              checked={questionType === "DESCRIPTIVE"}
              onChange={(e) => setQuestionType(e.target.value)}
              className="mr-2"
            />
            Descriptive
          </label>
        </div>
      </div>

      {/* Question Text */}
      <Input
        label="Question Text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        containerProps={{ className: "mb-4" }}
      />

      {/* Marks */}
      <Input
        label="Marks"
        type="number"
        value={marks}
        onChange={(e) => setMarks(parseInt(e.target.value))}
        containerProps={{ className: "mb-4" }}
      />

      {/* MCQ Options */}
      {questionType === "MCQ" && (
        <div className="mb-4">
          <label className="text-sm font-semibold">Options</label>
          {options.map((option, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOptionIndex === idx}
                onChange={() => setCorrectOptionIndex(idx)}
                className="mr-2"
              />
              <Input
                label={`Option ${idx + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[idx] = e.target.value;
                  setOptions(newOptions);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          className="bg-blue-600"
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

export default TeacherExamPanel;

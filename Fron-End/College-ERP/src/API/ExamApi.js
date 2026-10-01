import axiosInstance from "../utils/axiosInstance";

// ============= TEACHER EXAM APIS =============

// Create new exam
export const createExam = async (examData) => {
  try {
    const response = await axiosInstance.post(`/api/exams/create`, examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create exam";
  }
};

// Get professor's exams
export const getTeacherExams = async (teacherId) => {
  try {
    const response = await axiosInstance.get(`/api/exams/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch exams";
  }
};

// Update exam
export const updateExam = async (examId, examData) => {
  try {
    const response = await axiosInstance.put(`/api/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update exam";
  }
};

// Delete exam
export const deleteExam = async (examId) => {
  try {
    const response = await axiosInstance.delete(`/api/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete exam";
  }
};

// Publish exam
export const publishExam = async (examId) => {
  try {
    const response = await axiosInstance.post(`/api/exams/${examId}/publish`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to publish exam";
  }
};

// ============= QUESTION APIS =============

// Add question to exam
export const addQuestion = async (examId, questionData) => {
  try {
    const response = await axiosInstance.post(
      `/api/questions/add`,
      {
        ...questionData,
        examId,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to add question";
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await axiosInstance.put(
      `/api/questions/${questionId}`,
      questionData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to update question";
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await axiosInstance.delete(`/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete question";
  }
};

// Get questions for exam
export const getExamQuestions = async (examId) => {
  try {
    const response = await axiosInstance.get(`/api/questions/exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch questions";
  }
};

// ============= STUDENT EXAM APIS =============

// Get available exams for student
export const getAvailableExams = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/api/exams/available/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch exams";
  }
};

// Get exam by ID (for student)
export const getExamDetails = async (examId) => {
  try {
    const response = await axiosInstance.get(`/api/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch exam";
  }
};

// Start exam attempt
export const startExamAttempt = async (examId, studentId) => {
  try {
    const response = await axiosInstance.post(
      `/api/student-exams/start`,
      {
        examId,
        studentId,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to start exam";
  }
};

// Get active exam attempt
export const getActiveAttempt = async (examId, studentId) => {
  try {
    const response = await axiosInstance.get(
      `/api/student-exams/${examId}/${studentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch attempt";
  }
};

// Save answer
export const saveAnswer = async (studentExamId, questionId, answer) => {
  try {
    const response = await axiosInstance.post(
      `/api/student-answers/save`,
      {
        studentExamId,
        questionId,
        selectedOptionId: answer.selectedOptionId || null,
        descriptiveAnswer: answer.descriptiveAnswer || null,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to save answer";
  }
};

// Submit exam
export const submitExam = async (studentExamId) => {
  try {
    const response = await axiosInstance.post(
      `/api/student-exams/${studentExamId}/submit`,
      {}
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to submit exam";
  }
};

// Get exam result
export const getExamResult = async (studentExamId) => {
  try {
    const response = await axiosInstance.get(
      `/api/student-exams/${studentExamId}/result`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch result";
  }
};

// Get student's exam attempts
export const getStudentExamAttempts = async (studentId) => {
  try {
    const response = await axiosInstance.get(
      `/api/student-exams/student/${studentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch attempts";
  }
};

// Get all attempts for an exam (teacher view)
export const getExamAttempts = async (examId) => {
  try {
    const response = await axiosInstance.get(`/api/student-exams/exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch attempts";
  }
};
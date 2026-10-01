import axiosInstance from "../utils/axiosInstance";

export const getStudentsList = async () => {
  try {
    const response = await axiosInstance.get("/api/students/get-students");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    const response = await axiosInstance.post("/api/attendance/mark", attendanceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceSummary = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/api/attendance/summary/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

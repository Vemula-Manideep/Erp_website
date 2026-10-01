import axiosInstance from "../utils/axiosInstance";

// Function to send forgot password email based on role
export const sendForgotPasswordEmail = async (role, email) => {
  const endpointMap = {
    student: "/api/students/forgot-password",
    professor: "/api/professors/forgot-password",
    hod: "/api/hods/forgot-password",
  };

  try {
    const response = await axiosInstance.post(endpointMap[role], { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || "An error occurred";
  }
};

// Function to verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post(
      `/api/students/verify-otp?email=${encodeURIComponent(
        email
      )}&otp=${encodeURIComponent(otp)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "An error occurred");
  }
};

// Function to reset password
export const resetPassword = async ({ email, password }) => {
  try {
    const response = await axiosInstance.post(
      "/api/students/reset-password",
      {
        email,
        newPassword: password,
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data || "An error occurred";
    throw new Error(errorMessage);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post(
      "/api/students/register",
      userData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "An error occurred");
  }
};


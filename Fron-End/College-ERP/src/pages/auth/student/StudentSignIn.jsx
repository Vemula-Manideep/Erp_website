import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../utils/axiosInstance";

export function StudentSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/students/login", { username, password });

      if (response.status === 200) {
        const data = response.data;
        const studentId = data.id;

        await login("STUDENT", data);

        const studentResponse = await axiosInstance.get(`/api/students/${studentId}`);

        if (studentResponse.status === 200) {
          const studentData = studentResponse.data;
          localStorage.setItem("studentData", JSON.stringify(studentData));
          navigate("/dashboard/student/home");
        } else {
          throw new Error("Failed to fetch student data");
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data || "Login failed");
      } else {
        setError("An error occurred during login.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl bg-white/80 backdrop-blur-lg">

        {/* HEADER */}
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-bold text-blue-700">
            Student Login
          </Typography>
          <Typography className="text-gray-600">
            Welcome back! Please login
          </Typography>
        </div>

        {/* FORM */}
        <form onSubmit={handleSignIn} className="space-y-6">

          <div className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* TERMS */}
          <Checkbox label="Remember me" />

          {/* BUTTON */}
          <Button
            type="submit"
            fullWidth
            className="bg-blue-600 hover:bg-blue-700 transition-all rounded-xl py-3 text-lg"
          >
            Sign In
          </Button>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* LINKS */}
          <div className="flex justify-between text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* SOCIAL LOGIN */}
          <div className="space-y-3">
            <Button
              size="lg"
              color="white"
              className="flex items-center justify-center gap-2 shadow-md rounded-lg"
              fullWidth
            >
              <span>Sign in with Google</span>
            </Button>

            <Button
              size="lg"
              color="white"
              className="flex items-center justify-center gap-2 shadow-md rounded-lg"
              fullWidth
            >
              <span>Sign in with Twitter</span>
            </Button>
          </div>

          {/* SIGNUP */}
          <Typography className="text-center text-gray-600 text-sm">
            Not registered?
            <Link
              to="/auth/sign-up"
              className="text-blue-600 font-semibold ml-1"
            >
              Create account
            </Link>
          </Typography>

        </form>
      </Card>
    </div>
  );
}

export default StudentSignIn;
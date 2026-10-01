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

export function HODSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/hods/login", { username, password });

      if (response.status === 200) {
        const data = response.data;
        const hodId = data.id;

        await login("HOD", data);

        const hodResponse = await axiosInstance.get(`/api/hods/${hodId}`);

        if (hodResponse.status === 200) {
          const hodData = hodResponse.data;
          localStorage.setItem("hodData", JSON.stringify(hodData));
          navigate("/dashboard/hod/home");
        } else {
          throw new Error(`Failed to fetch HOD data: ${hodResponse.statusText}`);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-yellow-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-2xl bg-white/80 backdrop-blur-lg">

        {/* HEADER */}
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-bold text-amber-700">
            HOD Login
          </Typography>
          <Typography className="text-gray-600">
            Access your department dashboard
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
            className="bg-amber-600 hover:bg-amber-700 transition-all rounded-xl py-3 text-lg"
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
              className="text-amber-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* SIGNUP */}
          <Typography className="text-center text-gray-600 text-sm">
            Not registered?
            <Link
              to="/auth/hod/sign-up"
              className="text-amber-600 font-semibold ml-1"
            >
              Create account
            </Link>
          </Typography>

        </form>
      </Card>
    </div>
  );
}

export default HODSignIn;
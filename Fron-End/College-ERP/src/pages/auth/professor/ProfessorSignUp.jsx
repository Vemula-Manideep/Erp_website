import { Card, Input, Button, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function ProfessorSignUp() {
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [professorId, setProfessorId] = useState("");
  const [name, setName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [subject, setSubject] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageUrl(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("professorId", professorId);
    formData.append("name", name);
    formData.append("departmentName", departmentName);
    formData.append("subject", subject);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("subjects", subjects.split(","));

    try {
      await axios.post(
        "http://localhost:8080/api/professors/add-prof",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setError("");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError(error.response.data);
      } else {
        setError("Error uploading Professor data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-2xl rounded-2xl bg-white/80 backdrop-blur-lg">

        {/* HEADER */}
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-bold text-purple-700">
            Professor Registration
          </Typography>
          <Typography className="text-gray-600">
            Create your professor account
          </Typography>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">

          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl || "/placeholder-image.png"}
              className="w-24 h-24 rounded-full border-4 border-purple-500 object-cover shadow-md"
            />
            <input type="file" onChange={handleImageChange} />
            <Typography className="text-sm text-gray-500">
              Upload Profile Photo
            </Typography>
          </div>

          {/* BASIC INFO */}
          <div>
            <Typography className="text-lg font-semibold text-purple-600 mb-3">
              Basic Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Professor ID" value={professorId} onChange={(e) => setProfessorId(e.target.value)} />
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Department" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} />
              <Input label="Primary Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <Typography className="text-lg font-semibold text-purple-600 mb-3">
              Contact Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* ACCOUNT */}
          <div>
            <Typography className="text-lg font-semibold text-purple-600 mb-3">
              Account Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {/* SUBJECTS */}
          <Input
            label="Subjects (comma separated)"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />

          {/* BUTTON */}
          <Button
            type="submit"
            fullWidth
            className={`rounded-xl py-3 text-lg ${
              loading ? "bg-green-500" : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* FOOTER */}
          <Typography className="text-center text-gray-600 text-sm">
            Already have an account?
            <Link to="/login" className="text-purple-600 font-semibold ml-1">
              Sign In
            </Link>
          </Typography>

        </form>
      </Card>
    </div>
  );
}

export default ProfessorSignUp;
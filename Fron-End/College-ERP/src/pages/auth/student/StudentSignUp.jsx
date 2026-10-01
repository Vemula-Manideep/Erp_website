import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import profileImg from "/img/user.png";

export function StudentSignUp() {
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [studName, setstudName] = useState("");
  const [studFatherName, setstudFatherName] = useState("");
  const [studLastName, setstudLastName] = useState("");
  const [studentAge, setstudentAge] = useState("");
  const [studentDob, setstudentDob] = useState("");  
  const [studCaste, setstudCaste] = useState("");
  const [studCategory, setstudCategory] = useState("");
  const [studRollNo, setstudRollNo] = useState("");
  const [year, setYear] = useState("");
  const [studPhoneNumber, setstudPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/departments/get-dept"
        );
        const departmentNames = response.data.map((dept) => dept.name);
        setMajors(departmentNames);
      } catch (err) {
        setError("Failed to load departments.");
      }
    };
    fetchMajors();
  }, []);

  const resetForm = () => {
    setImageUrl(null);
    setPreviewUrl(null);
    setStudentId("");
    setUsername("");
    setPassword("");
    setEmail("");
    setstudName("");
    setstudFatherName("");
    setstudLastName("");
    setstudentAge("");
    setstudentDob("");
    setstudCaste("");
    setstudCategory("");
    setstudRollNo("");
    setYear("");
    setstudPhoneNumber("");
    setSelectedMajor("");
  };

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

    if (
      !username ||
      !password ||
      !email ||
      !studName ||
      !studentId ||
      !year ||
      !studRollNo
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("studentId", studentId);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("name", studName);
    formData.append("fatherName", studFatherName);
    formData.append("lastName", studLastName);
    formData.append("age", studentAge);
    formData.append("dob", studentDob);
    formData.append("caste", studCaste);
    formData.append("category", studCategory);
    formData.append("major", selectedMajor);
    formData.append("roll-no", studRollNo);
    formData.append("year", year);
    formData.append("phone-number", studPhoneNumber);

    try {
      await axios.post(
        "http://localhost:8080/api/students/add-student",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setError("");
      resetForm();
    } catch (error) {
      setError("Error uploading student data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-2xl rounded-2xl backdrop-blur-lg bg-white/80">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-bold text-blue-700">
            Student Registration
          </Typography>
          <Typography className="text-gray-600">
            Fill in your details to create an account
          </Typography>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">

          {/* PERSONAL */}
          <div>
            <Typography className="text-lg font-semibold text-blue-600 mb-3">
              Personal Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={studName} onChange={(e) => setstudName(e.target.value)} />
              <Input label="Last Name" value={studLastName} onChange={(e) => setstudLastName(e.target.value)} />
              <Input label="Father Name" value={studFatherName} onChange={(e) => setstudFatherName(e.target.value)} />
              <Input type="date" label="DOB" value={studentDob} onChange={(e) => setstudentDob(e.target.value)} />
              <Input label="Age" value={studentAge} onChange={(e) => setstudentAge(e.target.value)} />
              <Input label="Phone" value={studPhoneNumber} onChange={(e) => setstudPhoneNumber(e.target.value)} />
              <Input label="Caste" value={studCaste} onChange={(e) => setstudCaste(e.target.value)} />
              <Input label="Category" value={studCategory} onChange={(e) => setstudCategory(e.target.value)} />
            </div>
          </div>

          {/* ACADEMIC */}
          <div>
            <Typography className="text-lg font-semibold text-blue-600 mb-3">
              Academic Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              <Select label="Major" value={selectedMajor} onChange={(e) => setSelectedMajor(e)}>
                {majors.map((dept) => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
              <Input label="Year" value={year} onChange={(e) => setYear(e.target.value)} />
              <Input label="Roll Number" value={studRollNo} onChange={(e) => setstudRollNo(e.target.value)} />
            </div>
          </div>

          {/* ACCOUNT */}
          <div>
            <Typography className="text-lg font-semibold text-blue-600 mb-3">
              Account Info
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl || profileImg}
              className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover shadow-md"
            />
            <input type="file" onChange={handleImageChange} />
          </div>

          {/* TERMS */}
          <Checkbox label="I agree to Terms & Conditions" required />

          {/* BUTTON */}
          <Button
            type="submit"
            fullWidth
            className="bg-blue-600 hover:bg-blue-700 transition-all rounded-xl py-3 text-lg"
          >
            {loading ? "Submitting..." : "Register"}
          </Button>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

        </form>

        {/* FOOTER */}
        <Typography className="text-center mt-4 text-gray-600">
          Already have an account?
          <Link to="/auth/student/sign-in" className="text-blue-600 font-semibold ml-1">
            Sign In
          </Link>
        </Typography>
      </Card>
    </div>
  );
}

export default StudentSignUp;
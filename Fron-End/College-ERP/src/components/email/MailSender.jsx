import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Typography,
  Spinner,
  Select,
  Option,
  Checkbox,
} from "@material-tailwind/react";
import { PaperClipIcon } from "@heroicons/react/24/outline";

const MailSender = () => {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientType, setRecipientType] = useState("all-students");
  const [students, setStudents] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedProfessors, setSelectedProfessors] = useState([]);

  useEffect(() => {
    if (recipientType === "selected-students") fetchStudents();
    else if (recipientType === "selected-professors") fetchProfessors();
  }, [recipientType]);

  const fetchStudents = async () => {
    const res = await axios.get("http://localhost:8080/api/students");
    setStudents(res.data);
  };

  const fetchProfessors = async () => {
    const res = await axios.get("http://localhost:8080/api/professors");
    setProfessors(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("recipientType", recipientType);
    formData.append("subject", subject);
    formData.append("body", body);

    if (recipientType === "selected-students") {
      formData.append("selectedStudents", JSON.stringify(selectedStudents));
    } else if (recipientType === "selected-professors") {
      formData.append("selectedProfessors", JSON.stringify(selectedProfessors));
    } else if (
      recipientType === "individual-student" ||
      recipientType === "individual-professor"
    ) {
      formData.append("recipients", recipients);
    }

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      setIsLoading(true);
      await axios.post("http://localhost:8080/api/email/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Emails sent successfully!");
      resetForm();
    } catch (error) {
      alert("Failed to send email.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRecipients("");
    setSubject("");
    setBody("");
    setAttachments([]);
    setRecipientType("all-students");
    setSelectedStudents([]);
    setSelectedProfessors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex justify-center items-start p-6">
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl bg-white/90 backdrop-blur-lg">

        {/* HEADER */}
        <CardHeader className="bg-blue-600 text-white p-5 rounded-t-2xl">
          <Typography variant="h5" className="font-semibold">
            📧 Mail Sender
          </Typography>
          <Typography className="text-sm opacity-80">
            Send emails to students & professors
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* RECIPIENT TYPE */}
            <Select
              label="Recipient Type"
              value={recipientType}
              onChange={(value) => setRecipientType(value)}
            >
              <Option value="all-students">All Students</Option>
              <Option value="all-professors">All Professors</Option>
              <Option value="all">All Students + Professors</Option>
              <Option value="individual-student">Individual Student</Option>
              <Option value="individual-professor">Individual Professor</Option>
              <Option value="selected-students">Selected Students</Option>
              <Option value="selected-professors">Selected Professors</Option>
            </Select>

            {/* INDIVIDUAL INPUT */}
            {(recipientType === "individual-student" ||
              recipientType === "individual-professor") && (
              <Input
                label="Enter Email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            )}

            {/* STUDENT LIST */}
            {recipientType === "selected-students" && (
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                {students.map((s) => (
                  <Checkbox
                    key={s.id}
                    label={s.email}
                    checked={selectedStudents.includes(s.email)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedStudents([...selectedStudents, s.email])
                        : setSelectedStudents(
                            selectedStudents.filter((x) => x !== s.email)
                          )
                    }
                  />
                ))}
              </div>
            )}

            {/* PROFESSOR LIST */}
            {recipientType === "selected-professors" && (
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                {professors.map((p) => (
                  <Checkbox
                    key={p.id}
                    label={p.email}
                    checked={selectedProfessors.includes(p.email)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedProfessors([...selectedProfessors, p.email])
                        : setSelectedProfessors(
                            selectedProfessors.filter((x) => x !== p.email)
                          )
                    }
                  />
                ))}
              </div>
            )}

            {/* SUBJECT */}
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            {/* BODY */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email..."
              rows="5"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            />

            {/* FILE */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                onChange={(e) => setAttachments([...e.target.files])}
                className="hidden"
                id="file"
              />
              <label
                htmlFor="file"
                className="flex items-center gap-2 cursor-pointer text-blue-600"
              >
                <PaperClipIcon className="h-5 w-5" />
                Attach Files
              </label>
              {attachments.length > 0 && (
                <span className="text-sm text-gray-500">
                  {attachments.length} file(s)
                </span>
              )}
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              fullWidth
              className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3"
            >
              {isLoading ? <Spinner className="h-5 w-5" /> : "Send Email"}
            </Button>

          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default MailSender;
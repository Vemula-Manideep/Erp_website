import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Typography,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";

const NotificationSender = () => {
  const [recipientType, setRecipientType] = useState("STUDENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [readStatus, setReadStatus] = useState(false);
  const [sender, setSender] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecipientTypeChange = (value) => {
    setRecipientType(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const notificationData = {
      title,
      message,
      subject,
      timestamp,
      readStatus,
      recipientType,
      sender,
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:8080/api/notifications/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        }
      );

      if (response.ok) {
        alert("Notification sent successfully!");
        resetForm();
      } else {
        alert("Failed to send notification.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setSubject("");
    setTimestamp(new Date().toISOString());
    setReadStatus(false);
    setSender("");
    setRecipientType("STUDENT");
  };

  return (
    <div className="mt-12 px-4">
      <Card className="max-w-xl mx-auto backdrop-blur-lg bg-white/80 border border-gray-200 shadow-2xl rounded-2xl">

        {/* HEADER */}
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-t-2xl shadow-md">
          <Typography variant="h5" className="font-semibold">
            📢 Send Notification
          </Typography>
          <Typography className="text-sm opacity-80">
            Notify students & professors instantly
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* RECIPIENT */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Recipient Type
              </Typography>
              <Select
                value={recipientType}
                onChange={handleRecipientTypeChange}
              >
                <Option value="STUDENT">ALL STUDENTS</Option>
                <Option value="STUDENT">STUDENT</Option>
                <Option value="PROFESSOR">ALL PROFESSORS</Option>
                <Option value="PROFESSOR">PROFESSOR</Option>
                <Option value="BOTH">ALL STUDENTS + PROFESSORS</Option>
              </Select>
            </div>

            {/* TITLE */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Notification Title
              </Typography>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Message
              </Typography>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                placeholder="Write your message..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Subject
              </Typography>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Optional subject"
              />
            </div>

            {/* TIMESTAMP */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Schedule Time
              </Typography>
              <Input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
              />
            </div>

            {/* SENDER */}
            <div>
              <Typography className="text-sm font-medium mb-2 text-gray-700">
                Sender
              </Typography>
              <Input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Admin / HOD / System"
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              fullWidth
              className="bg-gradient-to-r from-blue-500 to-indigo-600 flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02] transition"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                "Send Notification 🚀"
              )}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotificationSender;
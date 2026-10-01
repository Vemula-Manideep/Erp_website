import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
} from "@material-tailwind/react";
import {
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Toast from "@/components/Toast";

/**
 * TeacherAlertPanel Component
 * 
 * Real-time proctoring alerts for teachers/professors
 * Monitors student violations during exams
 */
export function TeacherAlertPanel() {
  const [examAlerts, setExamAlerts] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const ws = useRef(null);
  const teacherId = localStorage.getItem("professorId");
  
  // ===== WEBSOCKET CONNECTION FOR ALERTS =====
  useEffect(() => {
    if (!teacherId) return;
    
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//localhost:8080/ws`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log("✅ Teacher Alert WebSocket connected");
        // Subscribe to all teacher's exam alerts
        ws.current.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            topic: `teacher-alerts-${teacherId}`,
          })
        );
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "VIOLATION_ALERT") {
            handleNewViolation(message);
          } else if (message.type === "EXAM_ALERT") {
            handleExamAlert(message);
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      ws.current.onclose = () => {
        console.log("⚠️ Teacher Alert WebSocket disconnected");
        setTimeout(connectWebSocket, 3000);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [teacherId]);
  
  // ===== HANDLE INCOMING VIOLATIONS =====
  const handleNewViolation = (message) => {
    const {
      examId,
      studentId,
      studentName,
      violationType,
      severity,
      timestamp,
    } = message;
    
    setExamAlerts((prev) => {
      const existingExamIndex = prev.findIndex((e) => e.examId === examId);
      
      if (existingExamIndex >= 0) {
        const updatedAlerts = [...prev];
        updatedAlerts[existingExamIndex].violations.push({
          studentId,
          studentName,
          violationType,
          severity,
          timestamp,
          id: Date.now(),
        });
        updatedAlerts[existingExamIndex].violationCount += 1;
        
        // Auto-dismiss if threshold exceeded
        if (
          updatedAlerts[existingExamIndex].violations.filter(
            (v) => v.studentId === studentId
          ).length >= 5
        ) {
          showToastMessage(
            `⚠️ Student ${studentName} auto-terminated from exam ${examId}`
          );
        }
        
        return updatedAlerts;
      }
      
      return [
        ...prev,
        {
          examId,
          studentName,
          violationCount: 1,
          violations: [
            {
              studentId,
              studentName,
              violationType,
              severity,
              timestamp,
              id: Date.now(),
            },
          ],
        },
      ];
    });
    
    // Show notification
    showToastMessage(`🚨 Violation: ${studentName} - ${violationType}`);
  };
  
  const handleExamAlert = (message) => {
    const { examId, type, details } = message;
    showToastMessage(`📋 ${type}: ${details}`);
  };
  
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };
  
  // ===== MANUAL EXAM TERMINATION =====
  const terminateStudentExam = async (examId, studentId) => {
    try {
      await fetch(
        `http://localhost:8080/api/exams/${examId}/terminate/${studentId}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      
      showToastMessage("Student exam terminated");
      
      // Notify via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "TERMINATE_EXAM",
            examId,
            studentId,
          })
        );
      }
    } catch (error) {
      console.error("Termination error:", error);
      showToastMessage("Failed to terminate exam");
    }
  };
  
  const filteredAlerts = examAlerts.filter((alert) =>
    alert.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Typography variant="h4" color="blue-gray">
          🎯 Proctoring Monitor
        </Typography>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <BellIcon className="h-5 w-5 text-blue-600" />
          <Typography className="text-blue-600 font-semibold">
            {examAlerts.reduce((acc, e) => acc + e.violationCount, 0)} Violations
          </Typography>
        </div>
      </div>
      
      {/* SEARCH */}
      <Input
        label="Search student..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<BellIcon />}
      />
      
      {/* ALERTS TABLE */}
      {filteredAlerts.length === 0 ? (
        <Card className="p-6 text-center">
          <Typography color="blue-gray">No active exam violations</Typography>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow className="bg-blue-50">
                <TableCell>Exam ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Violations</TableCell>
                <TableCell>Last Violation</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlerts.map((alert, idx) => (
                <TableRow key={idx} className="border-b hover:bg-blue-50">
                  <TableCell className="font-semibold">
                    {alert.examId}
                  </TableCell>
                  <TableCell>{alert.studentName}</TableCell>
                  <TableCell>
                    <Chip
                      value={`${alert.violationCount}`}
                      color={
                        alert.violationCount >= 5
                          ? "red"
                          : alert.violationCount >= 3
                          ? "orange"
                          : "yellow"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {alert.violations[alert.violations.length - 1]?.violationType}
                  </TableCell>
                  <TableCell>
                    {alert.violationCount < 5 && (
                      <Button
                        size="sm"
                        color="red"
                        onClick={() =>
                          terminateStudentExam(
                            alert.examId,
                            alert.violations[0].studentId
                          )
                        }
                      >
                        Terminate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* VIOLATION DETAILS (Expandable) */}
      {selectedExamId && (
        <Card className="p-6 bg-amber-50 border-l-4 border-amber-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Typography variant="h6" color="amber">
                Violation Details - Exam {selectedExamId}
              </Typography>
            </div>
            <button onClick={() => setSelectedExamId(null)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {examAlerts
            .find((e) => e.examId === selectedExamId)
            ?.violations.map((violation) => (
              <div
                key={violation.id}
                className="mb-3 p-3 bg-white rounded border-l-4 border-amber-400"
              >
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <Typography className="font-semibold">
                      {violation.violationType}
                    </Typography>
                    <Typography className="text-sm text-gray-600">
                      {violation.studentName} •{" "}
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Chip
                      size="sm"
                      value={violation.severity}
                      color={
                        violation.severity === "critical"
                          ? "red"
                          : "orange"
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
        </Card>
      )}
      
      {/* TOAST NOTIFICATION */}
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
}

export default TeacherAlertPanel;

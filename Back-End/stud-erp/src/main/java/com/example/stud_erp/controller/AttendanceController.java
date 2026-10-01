package com.example.stud_erp.controller;

import com.example.stud_erp.entity.Attendance;
import com.example.stud_erp.entity.ClassSession;
import com.example.stud_erp.payload.AttendanceMarkRequest;
import com.example.stud_erp.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<ClassSession> markAttendance(@RequestBody AttendanceMarkRequest request) {
        if (request.getAttendanceList() == null || request.getAttendanceList().isEmpty()) {
            throw new IllegalArgumentException("Students list is required.");
        }
        
        ClassSession session = attendanceService.saveAttendance(request);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/lecturer/subject")
    public ResponseEntity<Map<LocalDate, List<Attendance>>> getAttendance(
            @RequestParam String lecturer,
            @RequestParam String subject) {
        Map<LocalDate, List<Attendance>> records = attendanceService.getAttendanceByLecturerAndSubject(lecturer, subject);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<List<com.example.stud_erp.payload.AttendanceSummaryDTO>> getAttendanceSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummary(studentId));
    }
}

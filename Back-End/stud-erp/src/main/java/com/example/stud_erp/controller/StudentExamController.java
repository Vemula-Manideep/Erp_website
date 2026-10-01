package com.example.stud_erp.controller;

import com.example.stud_erp.entity.StudentExam;
import com.example.stud_erp.repository.StudentExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * StudentExamController handles exam attempts for students.
 * Maps /api/student-exams/* which ExamApi.js calls.
 */
@RestController
@RequestMapping("/api/student-exams")
@CrossOrigin(origins = "*")
public class StudentExamController {

    @Autowired
    private StudentExamRepository studentExamRepository;

    // Start an exam attempt
    @PostMapping("/start")
    public ResponseEntity<StudentExam> startExam(@RequestBody Map<String, Object> body) {
        try {
            Long examId = Long.valueOf(body.get("examId").toString());
            Long studentId = Long.valueOf(body.get("studentId").toString());

            Optional<StudentExam> existing = studentExamRepository.findByStudentIdAndExamId(studentId, examId);
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }

            StudentExam exam = new StudentExam();
            exam.setStudentId(studentId);
            exam.setExamId(examId);
            exam.setStatus(StudentExam.ExamStatus.ACTIVE);
            exam.setViolationCount(0);
            StudentExam saved = studentExamRepository.save(exam);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get active attempt for exam/student
    @GetMapping("/{examId}/{studentId}")
    public ResponseEntity<StudentExam> getAttempt(
        @PathVariable Long examId,
        @PathVariable Long studentId
    ) {
        return studentExamRepository.findByStudentIdAndExamId(studentId, examId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Submit exam
    @PostMapping("/{studentExamId}/submit")
    public ResponseEntity<Map<String, Object>> submitExam(
        @PathVariable Long studentExamId
    ) {
        Optional<StudentExam> opt = studentExamRepository.findById(studentExamId);
        if (opt.isPresent()) {
            StudentExam exam = opt.get();
            exam.setStatus(StudentExam.ExamStatus.COMPLETED);
            exam.setCompletedAt(LocalDateTime.now());
            studentExamRepository.save(exam);
            return ResponseEntity.ok(Map.of("status", "submitted", "id", studentExamId));
        }
        return ResponseEntity.notFound().build();
    }

    // Get result
    @GetMapping("/{studentExamId}/result")
    public ResponseEntity<StudentExam> getResult(@PathVariable Long studentExamId) {
        return studentExamRepository.findById(studentExamId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Get all attempts by student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentExam>> getStudentAttempts(@PathVariable Long studentId) {
        List<StudentExam> attempts = studentExamRepository.findByStudentId(studentId);
        return ResponseEntity.ok(attempts);
    }

    // Get all attempts for an exam (teacher view)
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<StudentExam>> getExamAttempts(@PathVariable Long examId) {
        List<StudentExam> attempts = studentExamRepository.findByExamId(examId);
        return ResponseEntity.ok(attempts);
    }
}

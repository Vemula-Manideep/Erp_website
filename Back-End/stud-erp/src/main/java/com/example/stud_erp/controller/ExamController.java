package com.example.stud_erp.controller;

import com.example.stud_erp.entity.StudentExam;
import com.example.stud_erp.repository.StudentExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ExamController handles exam CRUD for teachers
 * and exam listing for students.
 *
 * In-memory store is used for demo since no Exam entity exists yet.
 * Replace with real DB-backed service when ready.
 */
@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    // Simple in-memory store - replace with JPA when Exam entity is ready
    private static final List<Map<String, Object>> examStore = new ArrayList<>();
    private static Long nextId = 1L;

    @Autowired
    private StudentExamRepository studentExamRepository;

    // ─── TEACHER: Create Exam ────────────────────────────────────────────────
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createExam(@RequestBody Map<String, Object> examData) {
        try {
            examData.put("id", nextId++);
            examData.put("published", false);
            examStore.add(examData);
            return ResponseEntity.ok(examData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─── TEACHER: Get all exams by teacher ──────────────────────────────────
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Map<String, Object>>> getTeacherExams(@PathVariable Long teacherId) {
        List<Map<String, Object>> result = examStore.stream()
            .filter(e -> teacherId.toString().equals(String.valueOf(e.get("createdBy"))))
            .toList();
        return ResponseEntity.ok(result);
    }

    // ─── TEACHER: Update Exam ────────────────────────────────────────────────
    @PutMapping("/{examId}")
    public ResponseEntity<Map<String, Object>> updateExam(
        @PathVariable Long examId,
        @RequestBody Map<String, Object> examData
    ) {
        for (int i = 0; i < examStore.size(); i++) {
            if (examId.toString().equals(String.valueOf(examStore.get(i).get("id")))) {
                examData.put("id", examId);
                examStore.set(i, examData);
                return ResponseEntity.ok(examData);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ─── TEACHER: Delete Exam ────────────────────────────────────────────────
    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long examId) {
        examStore.removeIf(e -> examId.toString().equals(String.valueOf(e.get("id"))));
        return ResponseEntity.noContent().build();
    }

    // ─── TEACHER: Publish Exam ───────────────────────────────────────────────
    @PostMapping("/{examId}/publish")
    public ResponseEntity<Map<String, Object>> publishExam(@PathVariable Long examId) {
        for (Map<String, Object> exam : examStore) {
            if (examId.toString().equals(String.valueOf(exam.get("id")))) {
                exam.put("published", true);
                return ResponseEntity.ok(exam);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ─── STUDENT: Get available exams ───────────────────────────────────────
    @GetMapping("/available/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getAvailableExams(@PathVariable Long studentId) {
        List<Map<String, Object>> published = examStore.stream()
            .filter(e -> Boolean.TRUE.equals(e.get("published")))
            .toList();
        return ResponseEntity.ok(published);
    }

    // ─── Get exam by ID ──────────────────────────────────────────────────────
    @GetMapping("/{examId}")
    public ResponseEntity<Map<String, Object>> getExamById(@PathVariable Long examId) {
        return examStore.stream()
            .filter(e -> examId.toString().equals(String.valueOf(e.get("id"))))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

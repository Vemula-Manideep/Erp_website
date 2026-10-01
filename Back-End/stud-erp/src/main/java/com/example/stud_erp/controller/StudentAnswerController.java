package com.example.stud_erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * StudentAnswerController handles saving/fetching student answers during exams.
 * Maps /api/student-answers/* called by ExamApi.js saveAnswer().
 * In-memory store for demo - replace with JPA when entity is ready.
 */
@RestController
@RequestMapping("/api/student-answers")
@CrossOrigin(origins = "*")
public class StudentAnswerController {

    private static final List<Map<String, Object>> answerStore = new ArrayList<>();

    // Save / update a student's answer
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveAnswer(@RequestBody Map<String, Object> answerData) {
        try {
            Object studentExamId = answerData.get("studentExamId");
            Object questionId = answerData.get("questionId");

            // Update if exists, else add
            answerStore.removeIf(a ->
                String.valueOf(studentExamId).equals(String.valueOf(a.get("studentExamId"))) &&
                String.valueOf(questionId).equals(String.valueOf(a.get("questionId")))
            );
            answerStore.add(answerData);

            return ResponseEntity.ok(answerData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get all answers for a student exam
    @GetMapping("/exam/{studentExamId}")
    public ResponseEntity<List<Map<String, Object>>> getAnswers(@PathVariable Long studentExamId) {
        List<Map<String, Object>> result = answerStore.stream()
            .filter(a -> studentExamId.toString().equals(String.valueOf(a.get("studentExamId"))))
            .toList();
        return ResponseEntity.ok(result);
    }
}

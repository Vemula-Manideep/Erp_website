package com.example.stud_erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * QuestionController handles question management within exams.
 * Uses in-memory store for demo - replace with JPA backed service.
 */
@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private static final List<Map<String, Object>> questionStore = new ArrayList<>();
    private static Long nextId = 1L;

    // Add a question to an exam
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addQuestion(@RequestBody Map<String, Object> questionData) {
        try {
            questionData.put("id", nextId++);
            questionStore.add(questionData);
            return ResponseEntity.ok(questionData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get all questions for an exam
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsForExam(@PathVariable Long examId) {
        List<Map<String, Object>> result = questionStore.stream()
            .filter(q -> examId.toString().equals(String.valueOf(q.get("examId"))))
            .toList();
        return ResponseEntity.ok(result);
    }

    // Update a question
    @PutMapping("/{questionId}")
    public ResponseEntity<Map<String, Object>> updateQuestion(
        @PathVariable Long questionId,
        @RequestBody Map<String, Object> questionData
    ) {
        for (int i = 0; i < questionStore.size(); i++) {
            if (questionId.toString().equals(String.valueOf(questionStore.get(i).get("id")))) {
                questionData.put("id", questionId);
                questionStore.set(i, questionData);
                return ResponseEntity.ok(questionData);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a question
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionStore.removeIf(q -> questionId.toString().equals(String.valueOf(q.get("id"))));
        return ResponseEntity.noContent().build();
    }
}

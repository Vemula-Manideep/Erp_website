package com.example.stud_erp.controller;

import com.example.stud_erp.payload.ExamSubmissionDTO;
import com.example.stud_erp.payload.ExamStateDTO;
import com.example.stud_erp.payload.StudentExamDataDTO;
import com.example.stud_erp.entity.StudentExam;
import com.example.stud_erp.entity.Violation;
import com.example.stud_erp.repository.StudentExamRepository;
import com.example.stud_erp.service.ProctoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Exam Management and Proctoring
 * 
 * Endpoints for:
 * - Fetching exam data
 * - Saving exam state (for refresh recovery)
 * - Submitting exams
 * - Teacher termination
 * - Violation statistics
 */
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProctoringController {
    
    private final ProctoringService proctoringService;
    private final StudentExamRepository studentExamRepository;
    
    // TODO: Inject your existing Exam and Student services
    // private final ExamService examService;
    // private final StudentService studentService;
    
    /**
     * GET /api/exams/{examId}/student/{studentId}
     * 
     * Fetch exam data with state recovery
     * Returns: exam questions, remaining time, saved answers, violation count
     */
    @GetMapping("/{examId}/student/{studentId}")
    public ResponseEntity<StudentExamDataDTO> getExamData(
        @PathVariable Long examId,
        @PathVariable Long studentId
    ) {
        log.info("📖 Fetching exam data: Exam={}, Student={}", examId, studentId);
        
        try {
            // Get or create exam session
            Optional<StudentExam> existingSession = studentExamRepository
                .findByStudentIdAndExamId(studentId, examId);
            
            StudentExam session = existingSession.orElseGet(() -> {
                StudentExam newSession = new StudentExam();
                newSession.setStudentId(studentId);
                newSession.setExamId(examId);
                newSession.setStatus(StudentExam.ExamStatus.ACTIVE);
                newSession.setViolationCount(0);
                return studentExamRepository.save(newSession);
            });
            
            // TODO: Build StudentExamDataDTO from your Exam entity
            StudentExamDataDTO examData = StudentExamDataDTO.builder()
                .examId(examId)
                .title("Sample Exam")  // Fetch from Exam entity
                .durationMinutes(60)    // Fetch from Exam entity
                .remainingTime(calculateRemainingTime(session))
                .examStartTime(session.getStartedAt())
                .violationCount(session.getViolationCount())
                .currentQuestionIndex(0)
                .build();
            
            return ResponseEntity.ok(examData);
        } catch (Exception e) {
            log.error("❌ Error fetching exam data", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * PUT /api/exams/{examId}/student/{studentId}/state
     * 
     * Save exam state (answers, position, violations)
     * Called periodically and on violation events
     */
    @PutMapping("/{examId}/student/{studentId}/state")
    public ResponseEntity<Map<String, String>> saveExamState(
        @PathVariable Long examId,
        @PathVariable Long studentId,
        @RequestBody ExamStateDTO stateDTO
    ) {
        log.info("💾 Saving exam state: Exam={}, Student={}", examId, studentId);
        
        try {
            Optional<StudentExam> session = studentExamRepository
                .findByStudentIdAndExamId(studentId, examId);
            
            if (session.isPresent()) {
                StudentExam exam = session.get();
                
                // Save answers as JSON
                // exam.setSavedAnswers(objectMapper.writeValueAsString(stateDTO.getAnswers()));
                exam.setViolationCount(stateDTO.getViolationCount());
                exam.setUpdatedAt(LocalDateTime.now());
                
                studentExamRepository.save(exam);
                
                return ResponseEntity.ok(Map.of(
                    "status", "saved",
                    "timestamp", LocalDateTime.now().toString()
                ));
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Error saving exam state", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * POST /api/exams/{examId}/student/{studentId}/submit
     * 
     * Submit completed exam and record final violations
     */
    @PostMapping("/{examId}/student/{studentId}/submit")
    public ResponseEntity<Map<String, Object>> submitExam(
        @PathVariable Long examId,
        @PathVariable Long studentId,
        @RequestBody ExamSubmissionDTO submission
    ) {
        log.info("📤 Exam submitted: Exam={}, Student={}", examId, studentId);
        
        try {
            Optional<StudentExam> session = studentExamRepository
                .findByStudentIdAndExamId(studentId, examId);
            
            if (session.isPresent()) {
                StudentExam exam = session.get();
                exam.setStatus(StudentExam.ExamStatus.COMPLETED);
                exam.setCompletedAt(submission.getCompletedAt());
                exam.setScore(submission.getScore());
                
                studentExamRepository.save(exam);
                
                // TODO: Evaluate answers and calculate score
                
                return ResponseEntity.ok(Map.of(
                    "status", "submitted",
                    "score", submission.getScore(),
                    "violations", exam.getViolationCount()
                ));
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Error submitting exam", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * POST /api/exams/{examId}/terminate/{studentId}
     * 
     * Teacher manually terminates a student's exam
     */
    @PostMapping("/{examId}/terminate/{studentId}")
    public ResponseEntity<Map<String, String>> terminateExam(
        @PathVariable Long examId,
        @PathVariable Long studentId,
        @RequestParam(required = false) String reason
    ) {
        log.warn("👨‍🏫 Terminating exam: Exam={}, Student={}, Reason={}", 
            examId, studentId, reason);
        
        try {
            proctoringService.terminateExamByTeacher(
                examId,
                studentId,
                reason != null ? reason : "Terminated by instructor"
            );
            
            return ResponseEntity.ok(Map.of(
                "status", "terminated",
                "message", "Exam terminated successfully"
            ));
        } catch (Exception e) {
            log.error("❌ Error terminating exam", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/exams/{examId}/violations
     * 
     * Get all violations for an exam (for teacher review)
     */
    @GetMapping("/{examId}/violations")
    public ResponseEntity<List<Violation>> getExamViolations(
        @PathVariable Long examId
    ) {
        log.info("📋 Fetching violations: Exam={}", examId);
        
        try {
            List<Violation> violations = proctoringService.getExamViolations(examId);
            return ResponseEntity.ok(violations);
        } catch (Exception e) {
            log.error("❌ Error fetching violations", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/exams/{examId}/violations/student/{studentId}
     * 
     * Get violations for specific student
     */
    @GetMapping("/{examId}/violations/student/{studentId}")
    public ResponseEntity<List<Violation>> getStudentViolations(
        @PathVariable Long examId,
        @PathVariable Long studentId
    ) {
        log.info("📋 Fetching violations: Exam={}, Student={}", examId, studentId);
        
        try {
            List<Violation> violations = proctoringService
                .getStudentViolations(examId, studentId);
            return ResponseEntity.ok(violations);
        } catch (Exception e) {
            log.error("❌ Error fetching student violations", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * GET /api/exams/{examId}/stats
     * 
     * Get violation statistics for exam
     */
    @GetMapping("/{examId}/stats")
    public ResponseEntity<Map<String, Object>> getViolationStats(
        @PathVariable Long examId
    ) {
        log.info("📊 Fetching violation stats: Exam={}", examId);
        
        try {
            Map<String, Object> stats = proctoringService.getViolationStats(examId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("❌ Error fetching stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Helper methods
    
    private int calculateRemainingTime(StudentExam session) {
        // TODO: Calculate based on exam duration and elapsed time
        return 3600;  // Default 1 hour
    }
}

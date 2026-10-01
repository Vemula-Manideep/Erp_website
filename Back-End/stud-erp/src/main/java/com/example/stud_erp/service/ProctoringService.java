package com.example.stud_erp.service;

import com.example.stud_erp.configuration.ViolationReportDTO;
import com.example.stud_erp.entity.StudentExam;
import com.example.stud_erp.entity.Violation;
import com.example.stud_erp.repository.StudentExamRepository;
import com.example.stud_erp.repository.ViolationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ProctoringService
 * 
 * Core business logic for proctoring:
 * - Save and validate violations
 * - Calculate severity scores
 * - Check thresholds and terminate exams
 * - Broadcast alerts to teachers
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProctoringService {
    
    private final ViolationRepository violationRepository;
    private final StudentExamRepository studentExamRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    // Configuration
    private static final int VIOLATION_THRESHOLD = 5;
    private static final int CRITICAL_SEVERITY_THRESHOLD = 10;
    
    /**
     * Report and persist a violation
     */
    public Violation reportViolation(Long examId, Long studentId, ViolationReportDTO dto) {
        log.info("📝 Reporting violation: Student={}, Exam={}, Type={}, Severity={}",
            studentId, examId, dto.getType(), dto.getSeverity());
        
        // Get current exam session
        Optional<StudentExam> examSession = studentExamRepository
            .findByStudentIdAndExamId(studentId, examId);
        
        if (examSession.isEmpty()) {
            log.warn("⚠️ Exam session not found: Student={}, Exam={}", studentId, examId);
            return null;
        }
        
        StudentExam session = examSession.get();
        
        // Check if exam is still active
        if (session.getStatus() != StudentExam.ExamStatus.ACTIVE) {
            log.warn("⚠️ Exam already terminated for Student={}, Exam={}", studentId, examId);
            return null;
        }
        
        // Create and save violation
        Violation violation = new Violation();
        violation.setStudentId(studentId);
        violation.setExamId(examId);
        violation.setType(dto.getType());
        violation.setSeverity(dto.getSeverity());
        violation.setDescription(dto.getDescription());
        violation.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());
        
        violation = violationRepository.save(violation);
        log.info("✅ Violation saved: ID={}, Type={}", violation.getId(), violation.getType());
        
        // Update exam session violation count
        session.setViolationCount(session.getViolationCount() + 1);
        studentExamRepository.save(session);
        
        // Check thresholds
        evaluateViolationThreshold(examId, studentId, session);
        
        // Broadcast alert to teacher
        broadcastViolationAlert(examId, studentId, violation);
        
        return violation;
    }
    
    /**
     * Evaluate if violation threshold is exceeded
     */
    private void evaluateViolationThreshold(Long examId, Long studentId, StudentExam session) {
        int violationCount = session.getViolationCount();
        
        log.info("📊 Violation threshold check: Count={}/{}", violationCount, VIOLATION_THRESHOLD);
        
        // Calculate severity score
        int severityScore = calculateSeverityScore(examId, studentId);
        log.info("🔴 Severity score: {}", severityScore);
        
        // Auto-terminate if threshold exceeded
        if (violationCount >= VIOLATION_THRESHOLD || 
            severityScore >= CRITICAL_SEVERITY_THRESHOLD) {
            
            terminateExamByViolations(examId, studentId, session);
        }
    }
    
    /**
     * Calculate cumulative severity score
     * (High = 3, Critical = 5, etc.)
     */
    private int calculateSeverityScore(Long examId, Long studentId) {
        List<Violation> violations = violationRepository
            .findByStudentIdAndExamId(studentId, examId);
        
        return violations.stream()
            .mapToInt(v -> v.getSeverity().weight)
            .sum();
    }
    
    /**
     * Terminate exam due to violations
     */
    public void terminateExamByViolations(Long examId, Long studentId, StudentExam session) {
        log.error("🛑 TERMINATING EXAM - Student={}, Exam={} - TOO MANY VIOLATIONS", 
            studentId, examId);
        
        session.setStatus(StudentExam.ExamStatus.TERMINATED_BY_SYSTEM);
        session.setTerminatedAt(LocalDateTime.now());
        session.setTerminationReason("Multiple violations detected during exam");
        studentExamRepository.save(session);
        
        // Broadcast termination alert
        Map<String, Object> message = new HashMap<>();
        message.put("type", "EXAM_TERMINATED");
        message.put("examId", examId);
        message.put("studentId", studentId);
        message.put("reason", "Violations threshold exceeded");
        
        messagingTemplate.convertAndSend(
            "/topic/exam-" + examId + "-student-" + studentId,
            message
        );
    }
    
    /**
     * Manually terminate exam (by teacher)
     */
    public void terminateExamByTeacher(Long examId, Long studentId, String reason) {
        log.warn("👨‍🏫 MANUAL TERMINATION - Teacher terminated Student={}, Exam={}", 
            studentId, examId);
        
        Optional<StudentExam> session = studentExamRepository
            .findByStudentIdAndExamId(studentId, examId);
        
        if (session.isPresent()) {
            StudentExam exam = session.get();
            exam.setStatus(StudentExam.ExamStatus.TERMINATED_BY_TEACHER);
            exam.setTerminatedAt(LocalDateTime.now());
            exam.setTerminationReason(reason);
            studentExamRepository.save(exam);
            
            // Notify student and broadcast
            Map<String, Object> message = new HashMap<>();
            message.put("type", "EXAM_TERMINATED");
            message.put("examId", examId);
            message.put("studentId", studentId);
            message.put("reason", reason);
            
            messagingTemplate.convertAndSend(
                "/topic/exam-" + examId + "-student-" + studentId,
                message
            );
        }
    }
    
    /**
     * Broadcast violation alert to teacher's dashboard
     */
    private void broadcastViolationAlert(Long examId, Long studentId, Violation violation) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("type", "VIOLATION_ALERT");
        alert.put("examId", examId);
        alert.put("studentId", studentId);
        alert.put("studentName", getStudentName(studentId));  // Fetch from DB
        alert.put("violationType", violation.getType().toString());
        alert.put("severity", violation.getSeverity().toString());
        alert.put("timestamp", violation.getTimestamp());
        
        log.info("📤 Broadcasting alert to teacher: {}", alert);
        
        // Send to all teachers monitoring this exam
        messagingTemplate.convertAndSend(
            "/topic/teacher-alerts-" + getTeacherIdForExam(examId),
            alert
        );
    }
    
    /**
     * Get all violations for an exam
     */
    public List<Violation> getExamViolations(Long examId) {
        return violationRepository.findByExamId(examId);
    }
    
    /**
     * Get violations for a specific student in an exam
     */
    public List<Violation> getStudentViolations(Long examId, Long studentId) {
        return violationRepository.findByStudentIdAndExamId(studentId, examId);
    }
    
    /**
     * Get violation statistics for an exam
     */
    public Map<String, Object> getViolationStats(Long examId) {
        List<Violation> violations = getExamViolations(examId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalViolations", violations.size());
        stats.put("criticalViolations", 
            violations.stream().filter(v -> v.getSeverity() == Violation.SeverityLevel.CRITICAL).count());
        stats.put("highViolations",
            violations.stream().filter(v -> v.getSeverity() == Violation.SeverityLevel.HIGH).count());
        stats.put("violationsByType", 
            violations.stream().map(Violation::getType).distinct().count());
        
        return stats;
    }
    
    // Helper methods (to be implemented based on your existing DB structure)
    
    private String getStudentName(Long studentId) {
        // TODO: Fetch from Student entity
        return "Student " + studentId;
    }
    
    private Long getTeacherIdForExam(Long examId) {
        // TODO: Fetch teacher ID from Exam entity
        return 1L;
    }
}

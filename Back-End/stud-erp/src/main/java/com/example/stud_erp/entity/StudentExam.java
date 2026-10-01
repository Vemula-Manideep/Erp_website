package com.example.stud_erp.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * StudentExam Entity
 * 
 * Tracks exam sessions for students with proctoring status
 */
@Entity
@Table(name = "student_exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentExam {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "exam_id", nullable = false)
    private Long examId;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExamStatus status = ExamStatus.ACTIVE;
    
    @Column(name = "violation_count")
    private Integer violationCount = 0;
    
    @Column(name = "score")
    private Double score;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "terminated_at")
    private LocalDateTime terminatedAt;
    
    @Column(name = "termination_reason")
    private String terminationReason;
    
    @Column(name = "saved_answers", columnDefinition = "LONGTEXT")
    private String savedAnswers;  // JSON string
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Exam Status Enum
     */
    public enum ExamStatus {
        ACTIVE,                      // Exam in progress
        COMPLETED,                   // Exam submitted and completed
        TERMINATED_BY_SYSTEM,        // Auto-terminated due to violations
        TERMINATED_BY_TEACHER,       // Manually terminated by instructor
        NOT_STARTED,                 // Exam assigned but not started
        PAUSED,                      // Exam paused
        ABANDONED                    // Student left without completing
    }
}

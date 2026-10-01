package com.example.stud_erp.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Violation Entity
 * 
 * Persists proctoring violations detected during exams
 */
@Entity
@Table(name = "violations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Violation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "exam_id", nullable = false)
    private Long examId;
    
    @Column(name = "violation_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ViolationType type;
    
    @Column(name = "severity", nullable = false)
    @Enumerated(EnumType.STRING)
    private SeverityLevel severity;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
    
    /**
     * Violation Type Enum
     */
    public enum ViolationType {
        TAB_SWITCH,
        WINDOW_BLUR,
        FULLSCREEN_EXIT,
        DEVTOOLS_DETECTED,
        RIGHT_CLICK,
        COPY_ATTEMPT,
        PASTE_ATTEMPT,
        MULTIPLE_FACES_DETECTED,
        NO_FACE_DETECTED,
        SUSPICIOUS_MOVEMENT,
        AUDIO_DETECTED
    }
    
    /**
     * Severity Level Enum
     */
    public enum SeverityLevel {
        LOW(1),
        MEDIUM(2),
        HIGH(3),
        CRITICAL(5);
        
        public final int weight;
        
        SeverityLevel(int weight) {
            this.weight = weight;
        }
    }
}

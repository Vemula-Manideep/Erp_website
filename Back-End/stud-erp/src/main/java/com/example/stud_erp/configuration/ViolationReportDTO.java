
package com.example.stud_erp.configuration;

import com.example.stud_erp.entity.Violation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Violation Reporting
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationReportDTO {
    private Long examId;
    private Long studentId;
    private Violation.ViolationType type;
    private Violation.SeverityLevel severity;
    private String description;
    private LocalDateTime timestamp;
}

/**
 * DTO for Violation Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ViolationResponseDTO {
    private Long id;
    private Long studentId;
    private Long examId;
    private String type;
    private String severity;
    private String description;
    private LocalDateTime timestamp;
}

/**
 * DTO for WebSocket Alert Message
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AlertMessageDTO {
    private String type;           // VIOLATION_ALERT, EXAM_ALERT, etc.
    private Long examId;
    private Long studentId;
    private String studentName;
    private String violationType;
    private String severity;
    private LocalDateTime timestamp;
    private String message;
}

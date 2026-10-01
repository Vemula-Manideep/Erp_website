package com.example.stud_erp.configuration;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for Exam State Persistence
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamStateDTO {
    private Long studentId;
    private Long examId;
    private Map<Long, String> answers;  // questionId -> answer
    private Integer currentQuestionIndex;
    private Integer violationCount;
    private List<ViolationReportDTO> violations;
    private LocalDateTime savedAt;
}

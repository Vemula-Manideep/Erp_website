package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


import com.example.stud_erp.configuration.ViolationReportDTO;

/**
 * DTO for Exam Submission
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSubmissionDTO {
    private Map<Long, String> answers;
    private List<ViolationReportDTO> violations;
    private LocalDateTime completedAt;
    private Double score;
}

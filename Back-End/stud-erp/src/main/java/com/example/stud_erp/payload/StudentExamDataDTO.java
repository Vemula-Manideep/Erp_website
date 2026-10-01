package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for Exam Data Response (Student View)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentExamDataDTO {
    private Long examId;
    private String title;
    private Integer durationMinutes;
    private List<QuestionDTO> questions;
    private Integer remainingTime;
    private LocalDateTime examStartTime;
    private Map<Long, String> savedAnswers;
    private Integer currentQuestionIndex;
    private Integer violationCount;
}

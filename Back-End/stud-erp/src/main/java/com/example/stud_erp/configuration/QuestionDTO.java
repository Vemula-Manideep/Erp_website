

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
 * DTO for Question
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    private Long id;
    private String text;
    private String type;              // MCQ, SHORT_ANSWER, TRUE_FALSE
    private List<String> options;
    private Integer marks;
    private String description;
}
package com.college.erp.repository;

import com.college.erp.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * QuestionOptionRepository
 *
 * Database operations for QuestionOption entity
 */
@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {

    // Get all options for a question
    List<QuestionOption> findByQuestionIdOrderByOrderNumber(Long questionId);

    // Get correct option for a question
    QuestionOption findByQuestionIdAndIsCorrectTrue(Long questionId);

    // Delete options for a question
    void deleteByQuestionId(Long questionId);
}

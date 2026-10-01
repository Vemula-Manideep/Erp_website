package com.college.erp.repository;

import com.college.erp.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * QuestionRepository
 *
 * Database operations for Question entity
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Get all questions for an exam
    List<Question> findByExamIdOrderByOrderNumber(Long examId);

    // Count questions in an exam
    Integer countByExamId(Long examId);

    // Delete all questions for an exam
    void deleteByExamId(Long examId);
}

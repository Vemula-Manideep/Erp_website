package com.college.erp.repository;

import com.college.erp.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * StudentAnswerRepository
 *
 * Database operations for StudentAnswer entity
 */
@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    // Get answer for a specific question in an attempt
    Optional<StudentAnswer> findByStudentExamAttemptIdAndQuestionId(Long attemptId, Long questionId);

    // Get all answers for an attempt
    List<StudentAnswer> findByStudentExamAttemptId(Long attemptId);

    // Get answers for a question
    List<StudentAnswer> findByQuestionId(Long questionId);

    // Get unevaluated descriptive answers for an exam
    List<StudentAnswer> findByQuestionIdAndIsEvaluatedFalse(Long questionId);

    // Count evaluated answers
    Integer countByStudentExamAttemptIdAndIsEvaluatedTrue(Long attemptId);

    // Delete answers for an attempt
    void deleteByStudentExamAttemptId(Long attemptId);
}

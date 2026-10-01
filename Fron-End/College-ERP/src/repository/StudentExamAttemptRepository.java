package com.college.erp.repository;

import com.college.erp.entity.StudentExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * StudentExamAttemptRepository
 *
 * Database operations for StudentExamAttempt entity
 */
@Repository
public interface StudentExamAttemptRepository extends JpaRepository<StudentExamAttempt, Long> {

    // Get current active attempt for student
    @Query("SELECT s FROM StudentExamAttempt s WHERE s.studentId = ?1 AND s.examId = ?2 AND s.status = 'IN_PROGRESS'")
    Optional<StudentExamAttempt> findActiveAttempt(Long studentId, Long examId);

    // Get all attempts for a student
    List<StudentExamAttempt> findByStudentIdOrderByStartedAtDesc(Long studentId);

    // Get all attempts for an exam (teacher view)
    List<StudentExamAttempt> findByExamIdOrderByStudentId(Long examId);

    // Get attempts for a student in an exam
    List<StudentExamAttempt> findByStudentIdAndExamId(Long studentId, Long examId);

    // Count student's attempts in an exam
    Integer countByStudentIdAndExamId(Long studentId, Long examId);

    // Get latest attempt for a student in an exam
    @Query("SELECT s FROM StudentExamAttempt s WHERE s.studentId = ?1 AND s.examId = ?2 ORDER BY s.startedAt DESC LIMIT 1")
    Optional<StudentExamAttempt> findLatestAttempt(Long studentId, Long examId);
}

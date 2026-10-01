package com.college.erp.repository;

import com.college.erp.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ExamRepository
 *
 * Database operations for Exam entity
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    // Get all exams created by a teacher
    List<Exam> findByTeacherId(Long teacherId);

    // Get exams by status
    List<Exam> findByStatus(Exam.ExamStatus status);

    // Get published exams for students
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.startTime <= CURRENT_TIMESTAMP AND e.endTime >= CURRENT_TIMESTAMP")
    List<Exam> findActiveExams();

    // Get available exams (published and within time window)
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.startTime <= ?1 AND e.endTime >= ?1")
    List<Exam> findAvailableExamsAtTime(LocalDateTime time);

    // Check if exam exists
    boolean existsById(Long id);
}

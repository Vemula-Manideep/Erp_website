package com.example.stud_erp.repository;

import com.example.stud_erp.entity.StudentExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StudentExam Entity
 * 
 * Handles database operations for student exam sessions
 */
@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, Long> {
    
    /**
     * Find exam session by student ID and exam ID
     */
    Optional<StudentExam> findByStudentIdAndExamId(Long studentId, Long examId);
    
    /**
     * Find all active exams for a student
     */
    @Query("SELECT se FROM StudentExam se WHERE se.studentId = :studentId AND se.status = 'ACTIVE'")
    List<StudentExam> findActiveExamsByStudentId(@Param("studentId") Long studentId);
    
    /**
     * Find all exams for a student
     */
    List<StudentExam> findByStudentId(Long studentId);
    
    /**
     * Find all exam sessions for a given exam
     */
    List<StudentExam> findByExamId(Long examId);
    
    /**
     * Find exams terminated by system due to violations
     */
    @Query("SELECT se FROM StudentExam se WHERE se.examId = :examId AND se.status = 'TERMINATED_BY_SYSTEM'")
    List<StudentExam> findTerminatedBySystemExams(@Param("examId") Long examId);
    
    /**
     * Find students who completed an exam
     */
    @Query("SELECT se FROM StudentExam se WHERE se.examId = :examId AND se.status = 'COMPLETED'")
    List<StudentExam> findCompletedExams(@Param("examId") Long examId);
}

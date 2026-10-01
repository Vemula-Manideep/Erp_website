package com.example.stud_erp.repository;

import com.example.stud_erp.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Violation Entity
 * 
 * Handles database operations for proctoring violations
 */
@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    
    /**
     * Find all violations for a student in an exam
     */
    List<Violation> findByStudentIdAndExamId(Long studentId, Long examId);
    
    /**
     * Find violations by exam ID
     */
    List<Violation> findByExamId(Long examId);
    
    /**
     * Find violations by student ID
     */
    List<Violation> findByStudentId(Long studentId);
    
    /**
     * Find critical violations for a student in an exam
     */
    @Query("SELECT v FROM Violation v WHERE v.studentId = :studentId AND v.examId = :examId AND v.severity IN ('HIGH', 'CRITICAL')")
    List<Violation> findCriticalViolations(
        @Param("studentId") Long studentId,
        @Param("examId") Long examId
    );
    
    /**
     * Count violations for a student in an exam
     */
    long countByStudentIdAndExamId(Long studentId, Long examId);
    
    /**
     * Find violations within a time range
     */
    List<Violation> findByExamIdAndTimestampBetween(
        Long examId,
        LocalDateTime startTime,
        LocalDateTime endTime
    );
    
    /**
     * Find violations by type and exam
     */
    List<Violation> findByExamIdAndType(Long examId, Violation.ViolationType type);
}

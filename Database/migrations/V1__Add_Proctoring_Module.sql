-- ============================================================================
-- SQL Migration: Add Proctoring Module Tables
-- ============================================================================
-- This migration adds support for secure proctored examinations
-- Including violation tracking and exam state management
-- ============================================================================

-- ============================================================================
-- 1. CREATE violations TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS violations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    timestamp DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_student_exam (student_id, exam_id),
    INDEX idx_exam (exam_id),
    INDEX idx_student (student_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Proctoring violations during exams';

-- ============================================================================
-- 2. EXTEND student_exams TABLE (if not already exists)
-- ============================================================================
-- Create if missing
CREATE TABLE IF NOT EXISTS student_exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    violation_count INT DEFAULT 0,
    score DECIMAL(5,2),
    started_at DATETIME,
    completed_at DATETIME,
    terminated_at DATETIME,
    termination_reason VARCHAR(255),
    saved_answers LONGTEXT COMMENT 'JSON format',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_student_exam (student_id, exam_id),
    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Track student exam sessions with proctoring status';

-- ============================================================================
-- 3. ALTER student_exams TABLE (if already exists)
-- ============================================================================
-- Add missing columns if they don't exist
ALTER TABLE student_exams 
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS violation_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS termination_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS saved_answers LONGTEXT,
ADD COLUMN IF NOT EXISTS terminated_at DATETIME,
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes if missing
ALTER TABLE student_exams
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_violation_count (violation_count);

-- ============================================================================
-- 4. Create View for Violation Statistics
-- ============================================================================
DROP VIEW IF EXISTS violation_statistics;
CREATE VIEW violation_statistics AS
SELECT 
    e.exam_id,
    e.student_id,
    COUNT(v.id) as total_violations,
    SUM(CASE WHEN v.severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count,
    SUM(CASE WHEN v.severity = 'HIGH' THEN 1 ELSE 0 END) as high_count,
    MAX(v.timestamp) as last_violation_time
FROM student_exams e
LEFT JOIN violations v ON e.exam_id = v.exam_id AND e.student_id = v.student_id
GROUP BY e.exam_id, e.student_id;

-- ============================================================================
-- 5. Create View for Exam Summary
-- ============================================================================
DROP VIEW IF EXISTS exam_completion_summary;
CREATE VIEW exam_completion_summary AS
SELECT 
    exam_id,
    COUNT(*) as total_students,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN status = 'TERMINATED_BY_SYSTEM' THEN 1 ELSE 0 END) as auto_terminated_count,
    SUM(CASE WHEN status = 'TERMINATED_BY_TEACHER' THEN 1 ELSE 0 END) as manual_terminated_count,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_count,
    AVG(score) as average_score,
    AVG(violation_count) as avg_violations
FROM student_exams
GROUP BY exam_id;

-- ============================================================================
-- 6. Sample Data (Optional)
-- ============================================================================
-- Uncomment to add test data
/*
INSERT INTO violations (student_id, exam_id, violation_type, severity, description, timestamp)
VALUES 
(1, 1, 'TAB_SWITCH', 'HIGH', 'Student switched tabs during exam', NOW()),
(1, 1, 'WINDOW_BLUR', 'MEDIUM', 'Exam window lost focus', NOW()),
(2, 1, 'COPY_ATTEMPT', 'MEDIUM', 'Attempted to copy question text', NOW());

INSERT INTO student_exams (student_id, exam_id, status, violation_count, started_at)
VALUES 
(1, 1, 'ACTIVE', 2, NOW()),
(2, 1, 'ACTIVE', 1, NOW());
*/

-- ============================================================================
-- 7. Verification
-- ============================================================================
-- Run these to verify the migration:
-- SELECT * FROM violations;
-- SELECT * FROM student_exams;
-- SELECT * FROM violation_statistics;
-- SELECT * FROM exam_completion_summary;

COMMIT;

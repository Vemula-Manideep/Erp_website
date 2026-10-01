-- ============================================
-- EXAM MANAGEMENT MODULE - DATABASE MIGRATION
-- ============================================
-- Run this script on your MySQL database to create the exam management tables

-- 1. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  teacher_id BIGINT NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in minutes',
  total_marks INT NOT NULL,
  negative_mark DECIMAL(5,2) DEFAULT 0,
  max_attempts INT DEFAULT 1,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'DRAFT, PUBLISHED, CLOSED',
  question_count INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  INDEX idx_end_time (end_time),
  
  CONSTRAINT fk_exam_teacher FOREIGN KEY (teacher_id) REFERENCES professors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  exam_id BIGINT NOT NULL,
  question_text LONGTEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'MCQ' COMMENT 'MCQ, DESCRIPTIVE',
  marks INT DEFAULT 1,
  order_number INT DEFAULT 0,
  created_at BIGINT,
  
  INDEX idx_exam_id (exam_id),
  INDEX idx_order_number (order_number),
  
  CONSTRAINT fk_question_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. QUESTION_OPTIONS TABLE
CREATE TABLE IF NOT EXISTS question_options (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT NOT NULL,
  option_text LONGTEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INT DEFAULT 0,
  created_at BIGINT,
  
  INDEX idx_question_id (question_id),
  
  CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. STUDENT_EXAM_ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS student_exam_attempts (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  exam_id BIGINT NOT NULL,
  status VARCHAR(30) DEFAULT 'IN_PROGRESS' COMMENT 'IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED, ABANDONED',
  started_at DATETIME NOT NULL,
  submitted_at DATETIME,
  total_score DECIMAL(5,2) DEFAULT 0,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  unanswered_questions INT DEFAULT 0,
  saved_answers LONGTEXT COMMENT 'JSON of saved answers for state recovery',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_student_id (student_id),
  INDEX idx_exam_id (exam_id),
  INDEX idx_student_exam (student_id, exam_id),
  INDEX idx_status (status),
  
  CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. STUDENT_ANSWERS TABLE
CREATE TABLE IF NOT EXISTS student_answers (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_exam_attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  selected_option_id BIGINT COMMENT 'FK to question_options (null for descriptive)',
  descriptive_answer LONGTEXT COMMENT 'For descriptive questions',
  marks_awarded DECIMAL(5,2),
  is_evaluated BOOLEAN DEFAULT FALSE COMMENT 'true after teacher evaluates descriptive',
  evaluation_comment TEXT,
  created_at BIGINT,
  updated_at BIGINT,
  
  INDEX idx_attempt_id (student_exam_attempt_id),
  INDEX idx_question_id (question_id),
  INDEX idx_attempt_question (student_exam_attempt_id, question_id),
  
  CONSTRAINT fk_answer_attempt FOREIGN KEY (student_exam_attempt_id) REFERENCES student_exam_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- HELPFUL VIEWS FOR REPORTING
-- ============================================

-- View: Exam Statistics
CREATE OR REPLACE VIEW exam_statistics AS
SELECT 
  e.id,
  e.title,
  e.subject,
  e.teacher_id,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT sea.id) as total_attempts,
  COUNT(DISTINCT CASE WHEN sea.status = 'SUBMITTED' THEN sea.id END) as submitted_attempts,
  AVG(CASE WHEN sea.status = 'SUBMITTED' THEN sea.total_score ELSE NULL END) as avg_score
FROM exams e
LEFT JOIN questions q ON e.id = q.exam_id
LEFT JOIN student_exam_attempts sea ON e.id = sea.exam_id
GROUP BY e.id, e.title, e.subject, e.teacher_id;

-- View: Student Performance Summary
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
  sea.student_id,
  e.title as exam_title,
  sea.total_score,
  e.total_marks,
  (sea.total_score / e.total_marks * 100) as percentage,
  CASE WHEN (sea.total_score / e.total_marks * 100) >= 40 THEN 'PASS' ELSE 'FAIL' END as result,
  sea.submitted_at,
  sea.correct_answers,
  sea.wrong_answers,
  sea.unanswered_questions
FROM student_exam_attempts sea
JOIN exams e ON sea.exam_id = e.id
WHERE sea.status IN ('SUBMITTED', 'AUTO_SUBMITTED');

-- ============================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data for testing

/*
-- Sample Exam
INSERT INTO exams (title, subject, description, teacher_id, duration, total_marks, negative_mark, max_attempts, start_time, end_time, status, question_count)
VALUES (
  'Java Fundamentals Quiz',
  'Object-Oriented Programming',
  'Test your knowledge on Java fundamentals',
  1,
  30,
  50,
  0.25,
  2,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 1 DAY),
  'PUBLISHED',
  5
);

-- Sample Questions
INSERT INTO questions (exam_id, question_text, type, marks, order_number) VALUES
(1, 'What is the output of System.out.println(5 / 2)?', 'MCQ', 1, 0),
(1, 'Which keyword is used to implement an interface?', 'MCQ', 1, 1),
(1, 'Explain what is polymorphism in Java.', 'DESCRIPTIVE', 2, 2);

-- Sample Options
INSERT INTO question_options (question_id, option_text, is_correct, order_number) VALUES
(1, '2', 1, 0),
(1, '2.5', 0, 1),
(1, '3', 0, 2),
(1, '2.0', 0, 3),
(2, 'implements', 1, 0),
(2, 'extends', 0, 1),
(2, 'interface', 0, 2),
(2, 'inherits', 0, 3);
*/

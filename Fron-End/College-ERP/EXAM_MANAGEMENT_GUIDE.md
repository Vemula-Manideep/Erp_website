# 📚 Exam Management Module - Complete Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Frontend Components](#frontend-components)
5. [Backend Services](#backend-services)
6. [API Reference](#api-reference)
7. [Setup Instructions](#setup-instructions)
8. [State Recovery & Edge Cases](#state-recovery--edge-cases)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The **Exam Management Module** is a complete system for creating, publishing, and taking exams in the College ERP system. It extends the existing architecture with:

- **Teacher Features**: Create exams, add MCQ & descriptive questions, set rules, publish
- **Student Features**: View available exams, take exams, auto-save answers, auto-submit on timeout
- **Backend**: Database-based timer, auto-evaluation for MCQ, answer persistence
- **Integration**: Role-based access control, state recovery on refresh, real-time score calculation

### Key Features ✨
✅ Backend-based timer (prevents client-side clock manipulation)  
✅ Auto-save answers every 30s (state recovery)  
✅ MCQ auto-evaluation with negative marking  
✅ Descriptive question support (manual evaluation)  
✅ Attempt limits and time window enforcement  
✅ Answer persistence across browser refresh  
✅ Real-time progress tracking  
✅ Role-based access control (PROFESSOR/STUDENT)  

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React 18.2)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TeacherExamPanel.jsx      StudentExamList.jsx                  │
│ ├─ Create Exam            ├─ View Available Exams              │
│ ├─ Add Questions          ├─ Check Eligibility                 │
│ ├─ Manage Questions       ├─ Start Attempt                     │
│ └─ Publish Exam           └─ View Attempts                     │
│                                                                 │
│ StudentExamAttempt.jsx                                         │
│ ├─ Full-screen Exam Interface                                  │
│ ├─ Backend-based Timer                                         │
│ ├─ Question Navigation                                         │
│ ├─ Auto-save Answers                                           │
│ ├─ Manual Submit                                               │
│ └─ View Results                                                │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API (HTTP)
                     │ localhost:8080/api
┌────────────────────▼────────────────────────────────────────────┐
│                    Backend (Spring Boot)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Controllers:                                                   │
│ ├─ ExamController (@PostMapping, @GetMapping, @PutMapping)    │
│ ├─ QuestionController (CRUD operations)                       │
│ └─ StudentExamAttemptController (attempt lifecycle)           │
│                                                                 │
│ Services:                                                      │
│ └─ ExamManagementService                                      │
│    ├─ createExam(), updateExam(), publishExam()              │
│    ├─ addQuestion(), deleteQuestion()                        │
│    ├─ startExamAttempt(), saveAnswer(), submitExam()         │
│    └─ auto-evaluate MCQ, store scores                         │
│                                                                 │
│ Repositories:                                                  │
│ ├─ ExamRepository                                             │
│ ├─ QuestionRepository                                         │
│ ├─ QuestionOptionRepository                                   │
│ ├─ StudentExamAttemptRepository                               │
│ └─ StudentAnswerRepository                                    │
│                                                                 │
│ Entities:                                                      │
│ ├─ Exam                                                        │
│ ├─ Question                                                    │
│ ├─ QuestionOption                                             │
│ ├─ StudentExamAttempt (with JSON answer storage)             │
│ └─ StudentAnswer                                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
                     │
                     │ JDBC/Hibernate
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   MySQL Database                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Tables:                                                        │
│ ├─ exams                                                       │
│ ├─ questions                                                   │
│ ├─ question_options                                            │
│ ├─ student_exam_attempts (with saved_answers JSON)           │
│ └─ student_answers                                            │
│                                                                 │
│ Views:                                                         │
│ ├─ exam_statistics                                            │
│ └─ student_performance_summary                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Table: exams
```sql
CREATE TABLE exams (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  teacher_id BIGINT NOT NULL (FK),
  duration INT NOT NULL,                    -- minutes
  total_marks INT NOT NULL,
  negative_mark DECIMAL(5,2) DEFAULT 0,
  max_attempts INT DEFAULT 1,
  start_time DATETIME NOT NULL,             -- when exam becomes available
  end_time DATETIME NOT NULL,               -- when exam closes
  status VARCHAR(20) DEFAULT 'DRAFT',       -- DRAFT, PUBLISHED, CLOSED
  question_count INT DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
)
```

### Table: questions
```sql
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL (FK),
  question_text LONGTEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'MCQ',           -- MCQ, DESCRIPTIVE
  marks INT DEFAULT 1,                      -- marks for this question
  order_number INT DEFAULT 0,               -- ordering
  created_at BIGINT
)
```

### Table: question_options
```sql
CREATE TABLE question_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL (FK),
  option_text LONGTEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INT DEFAULT 0,
  created_at BIGINT
)
```

### Table: student_exam_attempts
```sql
CREATE TABLE student_exam_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL (FK),
  exam_id BIGINT NOT NULL (FK),
  status VARCHAR(30) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, SUBMITTED, AUTO_SUBMITTED, ABANDONED
  started_at DATETIME NOT NULL,             -- for timer calculation
  submitted_at DATETIME,
  total_score DECIMAL(5,2) DEFAULT 0,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  unanswered_questions INT DEFAULT 0,
  saved_answers LONGTEXT,                   -- JSON: {"questionId": {"selectedOptionId": 1}}
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW()
)
```

### Table: student_answers
```sql
CREATE TABLE student_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_exam_attempt_id BIGINT NOT NULL (FK),
  question_id BIGINT NOT NULL (FK),
  selected_option_id BIGINT (FK, null for descriptive),
  descriptive_answer LONGTEXT,              -- for text answers
  marks_awarded DECIMAL(5,2),               -- after evaluation
  is_evaluated BOOLEAN DEFAULT FALSE,       -- MCQ auto-evaluated, descriptive manual
  evaluation_comment TEXT,
  created_at BIGINT,
  updated_at BIGINT
)
```

**Key Design Decisions:**
- `saved_answers` in `student_exam_attempts`: Stores JSON of all answers for state recovery
- `is_correct` field hidden from students in API responses
- Timer calculation: `(startedAt + duration*60) - now()` (backend-based)
- Negative marking: subtracted from score if wrong answer selected

---

## Frontend Components

### 1. TeacherExamPanel.jsx (620 lines)
**Location**: `/src/pages/dashboard/professor/TeacherExamPanel.jsx`

**Features:**
- Create exams with title, subject, duration, marks, rules
- Tab view: Draft exams | Published exams
- Edit exams (DRAFT only)
- Delete exams (DRAFT only)
- Publish exams (requires at least 1 question)
- Manage questions (inline dialog)

**Key Functions:**
```javascript
// Create exam with form validation
handleCreateExam() → POST /api/exams/create

// Load exams for teacher
loadExams() → GET /api/exams/teacher/{teacherId}

// Update exam (DRAFT only)
handleUpdateExam(examId) → PUT /api/exams/{examId}

// Publish exam (status: DRAFT → PUBLISHED)
handlePublishExam(examId) → POST /api/exams/{examId}/publish

// Delete exam (DRAFT only)
handleDeleteExam(examId) → DELETE /api/exams/{examId}
```

**Sub-component: TeacherQuestionBuilder**
- Add MCQ questions with 4 options
- Add descriptive questions
- Set marks per question
- Mark correct option for MCQ
- Delete questions
- Real-time question count update

---

### 2. StudentExamList.jsx (380 lines)
**Location**: `/src/pages/dashboard/student/StudentExamList.jsx`

**Features:**
- Display available exams (published + within time window)
- Show exam eligibility:
  - ✅ Time window check
  - ✅ Attempts remaining check
  - ✅ Display attempt count vs max attempts
- Start exam button (disabled if not eligible)
- Exam details: duration, marks, questions, subject
- Pre-start confirmation dialog

**Key Functions:**
```javascript
// Load available exams for student
loadAvailableExams() → GET /api/exams/available/{studentId}

// Load student's previous attempts
loadAttempts() → GET /api/student-exams/student/{studentId}

// Start exam attempt
handleStartExam(examId) → POST /api/student-exams/start
  ↓ Stores attemptId in localStorage
  ↓ Navigates to StudentExamAttempt component
```

**Eligibility Logic:**
```javascript
canAttempt = isExamAvailable(exam) && attemptsRemaining > 0
```

---

### 3. StudentExamAttempt.jsx (650 lines)
**Location**: `/src/pages/dashboard/student/StudentExamAttempt.jsx`

**Features:**
- Full-screen exam interface
- Backend-based timer (minutes:seconds:format)
- Question navigation (previous/next buttons)
- Question navigator sidebar (visual progress)
- MCQ radio button selection
- Descriptive textarea for text answers
- Auto-save answers every time user types
- Progress bar showing completion
- Manual submit button
- Auto-submit on timeout
- Result display after submission

**Key Functions:**
```javascript
// Initialize exam with state recovery
initializeExam() → GET /api/student-exams/{examId}/{studentId}

// Calculate remaining time (backend-based to prevent tampering)
calculateRemainingTime(exam, attempt) {
  const endTime = startTime + duration*60*1000
  return endTime - now
}

// Auto-save answer periodically
handleAnswerChange() → POST /api/student-answers/save

// Submit exam
handleSubmitExam() → POST /api/student-exams/{attemptId}/submit

// Get result
getExamResult() → GET /api/student-exams/{attemptId}/result
```

**Timer Logic (Critical):**
```
Backend stores: startedAt (timestamp)
Exam duration: duration (minutes)
Frontend calculates: remaining = (startedAt + duration*60*1000) - now()
Updates every 1 second via setInterval
Auto-submits when remaining === 0
```

**Answer Format (JSON stored in DB):**
```javascript
{
  "1": { "selectedOptionId": 5 },           // MCQ answer
  "2": { "selectedOptionId": 12 },
  "3": { "descriptiveAnswer": "text..." }   // Descriptive answer
}
```

---

## Backend Services

### ExamManagementService.java (450 lines)

**Core Methods:**

#### Exam Management
```java
ExamDTO createExam(ExamDTO)
- Validates exam data
- Sets status = DRAFT
- Saves to database

ExamDTO publishExam(Long examId)
- Checks status == DRAFT
- Validates ≥1 question exists
- Changes status = PUBLISHED

ExamDTO updateExam(Long examId, ExamDTO)
- Only allows DRAFT exams
- Updates all fields
- Saves timestamp

void deleteExam(Long examId)
- Only DRAFT exams
- Cascades delete: questions, options, attempts, answers
```

#### Question Management
```java
QuestionDTO addQuestion(Long examId, QuestionDTO)
- Sets orderNumber = maxOrderNumber + 1
- Saves question
- If MCQ: creates options
- Updates questionCount in Exam entity

List<QuestionDTO> getExamQuestions(Long examId)
- Returns questions with options
- Hides isCorrect from options (for students)

QuestionDTO updateQuestion(Long questionId, QuestionDTO)
- Updates question text and marks
- Deletes old options, creates new ones

void deleteQuestion(Long questionId)
- Deletes question, options, student answers
- Updates question count
```

#### Student Exam Attempts
```java
StudentExamAttemptDTO startExamAttempt(Long examId, Long studentId)
- Checks exam is PUBLISHED
- Checks time window: now() >= startTime AND now() <= endTime
- Checks attempts: count < maxAttempts
- Checks for existing IN_PROGRESS attempt
- Creates StudentExamAttempt with startedAt = now
- Creates empty StudentAnswer records for each question
- Returns attempt with state recovery data

void saveAnswer(Long studentExamId, Long questionId, Long optionId, String descriptiveAnswer)
- Finds or creates StudentAnswer record
- Saves answer
- Updates savedAnswers JSON in StudentExamAttempt

ExamResultDTO submitExam(Long studentExamAttemptId)
- Sets status = SUBMITTED, submittedAt = now
- For each question:
  • MCQ: Auto-evaluate, award marks or deduct negative_mark
  • Descriptive: Mark as pending, set is_evaluated = false
- Calculates totalScore = sum(awarded marks)
- Returns ExamResultDTO with score, percentage, pass/fail
```

---

## API Reference

### Base URL: `http://localhost:8080/api`

### Exam Endpoints

#### Create Exam (Teacher)
```
POST /exams/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Java Fundamentals",
  "subject": "OOP",
  "description": "Basic Java concepts",
  "teacherId": 1,
  "duration": 60,
  "totalMarks": 100,
  "negativeMark": 0.25,
  "maxAttempts": 2,
  "startTime": "2024-01-15T10:00:00",
  "endTime": "2024-01-15T18:00:00"
}

Response (201 Created):
{
  "id": 5,
  "title": "Java Fundamentals",
  "status": "DRAFT",
  "questionCount": 0,
  ...
}
```

#### Get Teacher's Exams
```
GET /exams/teacher/{teacherId}
Authorization: Bearer {token}

Response (200):
[
  { "id": 5, "title": "Java Fundamentals", "status": "DRAFT", ... },
  { "id": 6, "title": "Python Basics", "status": "PUBLISHED", ... }
]
```

#### Update Exam (DRAFT only)
```
PUT /exams/{examId}
Authorization: Bearer {token}

Body: { "title": "...", "duration": 90, ... }

Response (200): Updated ExamDTO
```

#### Publish Exam
```
POST /exams/{examId}/publish
Authorization: Bearer {token}

Response (200): ExamDTO with status="PUBLISHED"
```

#### Delete Exam (DRAFT only)
```
DELETE /exams/{examId}
Authorization: Bearer {token}

Response (204 No Content)
```

#### Get Available Exams (Student)
```
GET /exams/available/{studentId}
Authorization: Bearer {token}

Response (200):
[
  { "id": 6, "title": "Python Basics", "status": "PUBLISHED", "startTime": "...", ... }
]
```

### Question Endpoints

#### Add Question
```
POST /questions/add
Authorization: Bearer {token}

{
  "examId": 5,
  "questionText": "What is OOP?",
  "type": "MCQ",
  "marks": 5,
  "options": [
    { "optionText": "Object-Oriented Programming", "isCorrect": true },
    { "optionText": "Object Ordering Protocol", "isCorrect": false },
    ...
  ]
}

Response (201): QuestionDTO with options
```

#### Get Questions for Exam
```
GET /questions/exam/{examId}
Authorization: Bearer {token}

Response (200):
[
  {
    "id": 10,
    "questionText": "What is OOP?",
    "type": "MCQ",
    "marks": 5,
    "options": [...]
  }
]
```

#### Update Question
```
PUT /questions/{questionId}
Authorization: Bearer {token}

Body: { "questionText": "...", "marks": 10, "options": [...] }

Response (200): QuestionDTO
```

#### Delete Question
```
DELETE /questions/{questionId}
Authorization: Bearer {token}

Response (204 No Content)
```

### Student Exam Attempt Endpoints

#### Start Exam
```
POST /student-exams/start
Authorization: Bearer {token}

{
  "examId": 5,
  "studentId": 10
}

Response (201):
{
  "id": 23,
  "studentId": 10,
  "examId": 5,
  "status": "IN_PROGRESS",
  "startedAt": "2024-01-15T10:05:00",
  "savedAnswers": {}
}
```

#### Get Active Attempt (State Recovery)
```
GET /student-exams/{examId}/{studentId}
Authorization: Bearer {token}

Response (200): StudentExamAttemptDTO with savedAnswers JSON
```

#### Save Answer (Auto-save)
```
POST /student-answers/save
Authorization: Bearer {token}

{
  "studentExamId": 23,
  "questionId": 10,
  "selectedOptionId": 50,           -- null for descriptive
  "descriptiveAnswer": null         -- null for MCQ
}

Response (200): { "status": "saved" }
```

#### Submit Exam
```
POST /student-exams/{studentExamId}/submit
Authorization: Bearer {token}

Response (200):
{
  "studentExamAttemptId": 23,
  "examId": 5,
  "studentId": 10,
  "totalScore": 75.5,
  "totalQuestions": 20,
  "correctAnswers": 18,
  "wrongAnswers": 2,
  "unansweredQuestions": 0,
  "percentage": 75.5,
  "status": "PASS",
  "submittedAt": "2024-01-15T10:55:00"
}
```

#### Get Exam Result
```
GET /student-exams/{studentExamId}/result
Authorization: Bearer {token}

Response (200): ExamResultDTO (same as submit response)
```

#### Get Student's Attempts
```
GET /student-exams/student/{studentId}
Authorization: Bearer {token}

Response (200): List<StudentExamAttemptDTO>
```

#### Get All Attempts for Exam (Teacher)
```
GET /student-exams/exam/{examId}
Authorization: Bearer {token}

Response (200): List<StudentExamAttemptDTO>
```

---

## Setup Instructions

### 1. Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database (if not exists)
CREATE DATABASE college_erp;

# Run migration script
SOURCE /path/to/database_migration_exam_management.sql;

# Verify tables created
SHOW TABLES;
```

### 2. Backend Configuration

**pom.xml** - Ensure these dependencies are added:
```xml
<!-- Already in Spring Boot starter-web -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- For JSON processing -->
<dependency>
  <groupId>com.google.code.gson</groupId>
  <artifactId>gson</artifactId>
  <version>2.8.9</version>
</dependency>
```

**application.properties**:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Security
spring.security.enabled=true
```

### 3. Frontend Integration

**Update routes.jsx** to add exam routes:

```javascript
// Lazy load components
const TeacherExamPanel = lazy(() => 
  import('@/pages/dashboard/professor/TeacherExamPanel')
);
const StudentExamList = lazy(() => 
  import('@/pages/dashboard/student/StudentExamList')
);
const StudentExamAttempt = lazy(() => 
  import('@/pages/dashboard/student/StudentExamAttempt')
);

// Add routes
{
  title: 'Exam Management',
  icon: BookOpenIcon,
  route: '/professor/exams',
  component: <TeacherExamPanel />
},
{
  title: 'Take Exam',
  icon: ClipboardDocumentCheckIcon,
  route: '/student/exams',
  component: <StudentExamList />
},
{
  title: 'Exam Attempt',
  route: '/student/exam-attempt/:attemptId',
  component: <StudentExamAttempt />
}
```

### 4. Test the System

```bash
# 1. Start backend
cd /path/to/backend
mvn spring-boot:run

# 2. Start frontend
cd /path/to/frontend
npm run dev

# 3. Login as Professor
# Go to http://localhost:5173/login
# Use professor credentials

# 4. Create test exam
# Navigate to Exam Management
# Click "Create Exam"
# Fill in details
# Add questions

# 5. Publish exam
# Click publish button on draft exam

# 6. Login as Student
# Logout and login with student credentials

# 7. Start exam
# Go to "Take Exam"
# Click "Start Exam" on available exam

# 8. Submit answers
# Answer questions
# Submit exam
# View results
```

---

## State Recovery & Edge Cases

### Scenario: Page Refresh During Exam

**Problem**: Student refreshes page during exam. What happens?

**Solution (Backend-based):**
1. Frontend calls `GET /student-exams/{examId}/{studentId}`
2. Backend returns current attempt with `savedAnswers` JSON
3. Frontend restores all previous answers from JSON
4. Timer recalculates: `remaining = (startedAt + duration*60*1000) - now()`
5. Exam continues seamlessly

**Code Flow:**
```javascript
// StudentExamAttempt.jsx - initializeExam()
const attemptData = await getActiveAttempt(examId, studentId);
const { savedAnswers } = attemptData;
setAnswers(savedAnswers); // Restore previous answers
calculateRemainingTime(examData, attemptData); // Recalculate timer
```

### Scenario: Multi-Tab Exam Abuse

**Current Design**: Each tab creates separate attempt
**Recommendation**: Add instance check on frontend:

```javascript
// Check if exam already open in another tab
if (localStorage.getItem(`exam_${examId}_open`)) {
  alert("Exam already open in another tab!");
  return;
}
localStorage.setItem(`exam_${examId}_open`, "true");
```

### Scenario: Network Disconnection

**Problem**: Student loses connection mid-exam

**Solution:**
1. Frontend has local state in memory
2. Auto-save triggers every 30 seconds
3. If network down, auto-save fails silently
4. When network restores, next auto-save succeeds
5. On page refresh, answers recovered from DB

**Code**:
```javascript
// Auto-save with fallback
const saveAnswerWithRetry = async () => {
  try {
    await saveAnswer(...); // POST to backend
    console.log("Answer saved to backend");
  } catch (error) {
    console.warn("Network error, will retry on next save", error);
    // Answer still in local state, will retry in 30s
  }
};
```

### Scenario: Timer Expiration

**Timer reaches 0:**
1. Frontend detects `timeRemaining === 0`
2. Automatically calls `submitExam()`
3. Backend receives submission
4. Backend evaluates MCQ answers
5. Returns result DTO
6. Frontend displays pass/fail screen

**Code**:
```javascript
// StudentExamAttempt.jsx - timer effect
useEffect(() => {
  if (timeRemaining === 0) {
    handleAutoSubmit(); // Auto-submit
  }
}, [timeRemaining]);
```

---

## Troubleshooting

### Issue 1: "Exam not found" error

**Cause**: Exam ID not in database, or wrong examId passed

**Solution:**
```bash
# Check database
SELECT id, title, status FROM exams;

# Verify in browser network tab
# Check URL parameters: /api/exams/{examId}
```

### Issue 2: "Can only update DRAFT exams"

**Cause**: Trying to edit published exam

**Solution:**
```javascript
// Only allow edit if status === "DRAFT"
if (exam.status !== "DRAFT") {
  alert("Published exams cannot be edited. Delete and recreate.");
}
```

### Issue 3: "Time's up!" but exam doesn't submit

**Cause**: Frontend timer reached 0, but network error on submit

**Solution**:
```javascript
// Add retry logic
const handleAutoSubmit = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      await submitExam(attemptId);
      break;
    } catch (error) {
      retries--;
      if (retries > 0) await new Promise(r => setTimeout(r, 1000));
    }
  }
};
```

### Issue 4: Answers not saved

**Cause**: Auto-save POST request failing (network/backend issue)

**Solution**:
```javascript
// Add error logging
saveAnswerToBackend() {
  try {
    await saveAnswer(...);
  } catch (error) {
    console.error("Save answer failed:", error);
    // Retry on next interval (30s)
  }
}
```

### Issue 5: Score calculation incorrect

**Cause**: Negative marking calculation or rounding error

**Solution**:
```java
// Ensure score >= 0
attempt.setTotalScore(Math.max(0, totalScore));

// Use proper rounding
BigDecimal score = new BigDecimal(totalScore)
  .setScale(2, RoundingMode.HALF_UP);
```

---

## Next Steps

### Enhancements to Consider:
1. **Analytics Dashboard**: Show exam statistics, student performance trends
2. **Question Bank**: Reusable questions across multiple exams
3. **Exam Templates**: Preset exam configurations
4. **Proctoring Integration**: Combine with existing proctoring module
5. **Mobile App**: Native exam app with offline support
6. **Descriptive Evaluation Panel**: Teacher interface to evaluate and mark descriptive answers
7. **Notifications**: Email/SMS when exams are published, results available
8. **Analytics Report**: PDF report of exam performance

---

## Support

For issues or questions:
1. Check logs: `tail -f backend.log` | `npm run dev` console
2. Verify database: `SELECT * FROM exams;`
3. Check API: Use Postman to test endpoints
4. Review browser DevTools Network tab for API errors

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Production Ready ✅

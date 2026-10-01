# ⚡ Exam Management - Quick Start (15 minutes)

## One-Time Setup

### Step 1: Database (2 min)
```bash
mysql -u root -p college_erp < database_migration_exam_management.sql
```

### Step 2: Verify Backend Classes (1 min)
- Check files exist in `src/`:
  - `entity/`: Exam.java, Question.java, QuestionOption.java, StudentExamAttempt.java, StudentAnswer.java
  - `repository/`: ExamRepository.java, QuestionRepository.java, etc.
  - `service/`: ExamManagementService.java
  - `controller/`: ExamController.java, QuestionController.java, StudentExamAttemptController.java
  - `dto/`: ExamDTO.java, QuestionDTO.java, StudentExamAttemptDTO.java, ExamResultDTO.java

### Step 3: Update Routes (1 min)
Update `src/routes.jsx`:
```javascript
import TeacherExamPanel from '@/pages/dashboard/professor/TeacherExamPanel';
import StudentExamList from '@/pages/dashboard/student/StudentExamList';
import StudentExamAttempt from '@/pages/dashboard/student/StudentExamAttempt';

// Add routes...
```

### Step 4: Verify API Constants (1 min)
Check `src/API/ExamApi.js` has base URL:
```javascript
const API_BASE_URL = "http://localhost:8080/api";
```

---

## Test Drive (10 min)

### As Professor:
1. **Start**: `npm run dev` (frontend) + backend running
2. **Login**: Go to `/login`, use professor account
3. **Create Exam**: 
   - Navigate to Exam Management (sidebar)
   - Click "Create Exam"
   - Fill: Title, Subject, Duration (30), Total Marks (50)
   - Click "Create Exam"
4. **Add Questions**:
   - Click "?" icon on exam row
   - Click "Add Question"
   - Add 3-5 MCQ questions with options
   - Mark correct option with radio button
5. **Publish**:
   - Click "✓" icon on exam
   - Confirm publish
   - Status changes to "Published" tab

### As Student:
1. **Logout** and login with student account
2. **View Exams**:
   - Go to "Take Exam" (sidebar)
   - See available published exams
3. **Start Exam**:
   - Click exam card
   - Confirm start
   - Exam timer starts
4. **Answer Questions**:
   - Select options (radio buttons)
   - Navigate with Previous/Next buttons
   - Watch timer count down
5. **Submit**:
   - Click "Submit Exam"
   - See results: Score, percentage, pass/fail

---

## API Testing (Postman)

### Create Exam
```
POST http://localhost:8080/api/exams/create
Authorization: Bearer {token}

{
  "title": "Test Exam",
  "subject": "Java",
  "duration": 30,
  "totalMarks": 50,
  "teacherId": 1,
  "startTime": "2024-12-01T10:00:00",
  "endTime": "2024-12-01T18:00:00"
}
```

### Add Question
```
POST http://localhost:8080/api/questions/add

{
  "examId": 1,
  "questionText": "What is Java?",
  "type": "MCQ",
  "marks": 5,
  "options": [
    { "optionText": "Programming Language", "isCorrect": true },
    { "optionText": "Coffee", "isCorrect": false }
  ]
}
```

### Start Exam
```
POST http://localhost:8080/api/student-exams/start

{
  "examId": 1,
  "studentId": 5
}
```

### Save Answer
```
POST http://localhost:8080/api/student-answers/save

{
  "studentExamId": 10,
  "questionId": 15,
  "selectedOptionId": 50
}
```

### Submit Exam
```
POST http://localhost:8080/api/student-exams/10/submit
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "Exam not published" | Click ✓ icon to publish first |
| Timer not counting | Check backend time is correct |
| Answers not saved | Check network tab for 200 response |
| "No active attempt" | Start exam first with "Start Exam" button |
| Database error | Run migration script in MySQL |

---

## File Checklist

✅ Frontend Components (3 files):
- TeacherExamPanel.jsx
- StudentExamList.jsx
- StudentExamAttempt.jsx

✅ Backend Entities (5 files):
- Exam.java
- Question.java
- QuestionOption.java
- StudentExamAttempt.java
- StudentAnswer.java

✅ Backend Repositories (5 files):
- ExamRepository.java
- QuestionRepository.java
- QuestionOptionRepository.java
- StudentExamAttemptRepository.java
- StudentAnswerRepository.java

✅ Backend DTOs (4 files):
- ExamDTO.java
- QuestionDTO.java
- QuestionOptionDTO.java
- StudentExamAttemptDTO.java
- ExamResultDTO.java

✅ Backend Services (1 file):
- ExamManagementService.java

✅ Backend Controllers (3 files):
- ExamController.java
- QuestionController.java
- StudentExamAttemptController.java

✅ API Layer (1 file):
- ExamApi.js

✅ Database (1 file):
- database_migration_exam_management.sql

✅ Documentation (2 files):
- EXAM_MANAGEMENT_GUIDE.md
- QUICK_START.md

---

**Total Implementation**: 25 files, ~3,500 lines of code ✅

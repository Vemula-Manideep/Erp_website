# ✅ Exam Management Module - Deployment Checklist

## Pre-Deployment Verification

### Database Setup (5 min)
- [ ] MySQL server running on localhost:3306
- [ ] Database `college_erp` exists
- [ ] Run migration script:
  ```bash
  mysql -u root -p college_erp < database_migration_exam_management.sql
  ```
- [ ] Verify tables created:
  ```sql
  SHOW TABLES LIKE '%exam%';
  -- Should show: exams, questions, question_options, student_exam_attempts, student_answers
  ```
- [ ] Verify indices created (check schema)

### Backend Configuration (3 min)
- [ ] Spring Boot version: 2.x or 3.x
- [ ] pom.xml includes:
  - [ ] spring-boot-starter-web
  - [ ] spring-boot-starter-data-jpa
  - [ ] spring-boot-starter-security
  - [ ] mysql-connector-java
  - [ ] gson (com.google.code.gson)
  - [ ] lombok
- [ ] application.properties configured:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
  spring.datasource.username=root
  spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
  spring.jpa.hibernate.ddl-auto=validate
  ```

### Backend Files (5 min)
Copy all backend files to `src/main/java/com/college/erp/`:

**Entities** (5 files):
- [ ] entity/Exam.java (95 lines)
- [ ] entity/Question.java (65 lines)
- [ ] entity/QuestionOption.java (55 lines)
- [ ] entity/StudentExamAttempt.java (120 lines)
- [ ] entity/StudentAnswer.java (90 lines)

**Repositories** (5 files):
- [ ] repository/ExamRepository.java (30 lines)
- [ ] repository/QuestionRepository.java (25 lines)
- [ ] repository/QuestionOptionRepository.java (20 lines)
- [ ] repository/StudentExamAttemptRepository.java (40 lines)
- [ ] repository/StudentAnswerRepository.java (35 lines)

**Service** (1 file):
- [ ] service/ExamManagementService.java (450 lines)

**Controllers** (3 files):
- [ ] controller/ExamController.java (90 lines)
- [ ] controller/QuestionController.java (60 lines)
- [ ] controller/StudentExamAttemptController.java (120 lines)

**DTOs** (5 files):
- [ ] dto/ExamDTO.java (60 lines)
- [ ] dto/QuestionDTO.java (55 lines)
- [ ] dto/QuestionOptionDTO.java (50 lines)
- [ ] dto/StudentExamAttemptDTO.java (85 lines)
- [ ] dto/ExamResultDTO.java (30 lines)

### Frontend Files (3 min)

**Components** (3 files):
- [ ] pages/dashboard/professor/TeacherExamPanel.jsx (620 lines)
- [ ] pages/dashboard/student/StudentExamList.jsx (380 lines)
- [ ] pages/dashboard/student/StudentExamAttempt.jsx (650 lines)

**API Layer** (1 file):
- [ ] API/ExamApi.js (200 lines)

**Configuration** (1 file):
- [ ] Update routes.jsx to include:
  ```javascript
  import TeacherExamPanel from '@/pages/dashboard/professor/TeacherExamPanel';
  import StudentExamList from '@/pages/dashboard/student/StudentExamList';
  import StudentExamAttempt from '@/pages/dashboard/student/StudentExamAttempt';
  
  // Add routes to navigation structure
  ```

### Documentation (1 min)
- [ ] EXAM_MANAGEMENT_GUIDE.md (reference manual)
- [ ] QUICK_START_EXAM_MODULE.md (setup guide)
- [ ] EXAM_MODULE_IMPLEMENTATION_SUMMARY.md (overview)
- [ ] database_migration_exam_management.sql (schema)

---

## Build & Test

### Backend Build
```bash
cd /path/to/backend
mvn clean package -DskipTests
# If successful: BUILD SUCCESS
```
- [ ] Compilation successful
- [ ] No errors or warnings
- [ ] JAR file created

### Backend Startup
```bash
# Option 1: Run from JAR
java -jar target/college-erp-*.jar

# Option 2: Run from IDE
# Right-click project > Run As > Spring Boot App

# Expected output:
# ...
# Tomcat started on port 8080 (http)
# Started Application in X seconds
```
- [ ] Server starts without errors
- [ ] No port conflicts
- [ ] Database connected

### Backend Health Check
```bash
curl http://localhost:8080/api/exams/health
# Expected: {"status":"OK","service":"ExamManagementService"}
```
- [ ] Health endpoint responds
- [ ] Status is "OK"

### Frontend Setup
```bash
cd /path/to/frontend
npm install    # Install dependencies
npm run dev    # Start dev server
# Expected: VITE v4.x ready in X ms
# ➜  Local:   http://localhost:5173/
```
- [ ] Dependencies installed
- [ ] Dev server running on port 5173
- [ ] No console errors

---

## Functional Testing

### Test 1: Create Exam (Professor)
**Steps:**
1. Login with professor account
2. Navigate to "Exam Management" (sidebar)
3. Click "Create Exam" button
4. Fill form:
   - Title: "Java Fundamentals Quiz"
   - Subject: "OOP"
   - Duration: 30
   - Total Marks: 50
   - Negative Mark: 0.25
   - Max Attempts: 2
   - Start: Today 10:00 AM
   - End: Today 6:00 PM
5. Click "Create Exam"

**Expected Result:**
- [ ] Exam created successfully
- [ ] Shows in "Draft" tab
- [ ] Question count: 0
- [ ] Status: DRAFT

---

### Test 2: Add Questions (Professor)
**Steps:**
1. From exam in Draft tab, click "?" (manage questions)
2. Click "Add Question"
3. Fill MCQ:
   - Type: MCQ (selected)
   - Question: "What is OOP?"
   - Marks: 5
   - Option 1: "Object-Oriented Programming" ✓ (correct)
   - Option 2: "Object Ordering Protocol"
   - Option 3: "Organized Processing"
   - Option 4: "Output Oriented Program"
4. Click "Add Question"
5. Repeat for 2 more questions

**Expected Result:**
- [ ] Questions added to exam
- [ ] Question navigator shows questions
- [ ] Can delete questions
- [ ] Question count updates

---

### Test 3: Publish Exam (Professor)
**Steps:**
1. In Draft tab, click "✓" (publish) on exam
2. Confirm in dialog

**Expected Result:**
- [ ] Exam moves to "Published" tab
- [ ] Status: PUBLISHED
- [ ] Exam locked (cannot edit anymore)
- [ ] Edit button disappears

---

### Test 4: View Available Exams (Student)
**Steps:**
1. Logout, login with student account
2. Navigate to "📚 Available Exams" (sidebar)
3. Check exam is listed

**Expected Result:**
- [ ] Published exam visible
- [ ] Shows duration, marks, questions
- [ ] Shows "Exam is LIVE" badge
- [ ] Shows attempts: 0/2

---

### Test 5: Start Exam (Student)
**Steps:**
1. Click "Start Exam" button on exam
2. Confirm in dialog
3. Wait for exam interface to load

**Expected Result:**
- [ ] Exam interface loads
- [ ] Timer starts (HH:MM:SS format)
- [ ] Questions display in sidebar
- [ ] First question shows on main panel

---

### Test 6: Answer Questions (Student)
**Steps:**
1. Select option for MCQ (radio button)
2. Check progress bar updates
3. Click Next button
4. Answer next question
5. Click Previous button to go back
6. Verify answer still selected

**Expected Result:**
- [ ] Options selectable
- [ ] Selection persists
- [ ] Question navigation works
- [ ] Progress bar shows completed questions

---

### Test 7: Auto-Save (Student)
**Steps:**
1. Select answer for first question
2. Open browser DevTools (F12)
3. Go to Network tab
4. Wait ~1 second
5. Check for POST request to `/student-answers/save`

**Expected Result:**
- [ ] Network request shows 200 status
- [ ] Request body includes questionId and answer
- [ ] No errors in console

---

### Test 8: Page Refresh (State Recovery)
**Steps:**
1. Answer 2-3 questions
2. Note remaining time (e.g., 25:30)
3. Press F5 (refresh page)
4. Wait for reload
5. Verify state recovered

**Expected Result:**
- [ ] Page reloads
- [ ] Previous answers restored
- [ ] Timer continues from ~same time
- [ ] No loss of progress

---

### Test 9: Submit Exam (Student)
**Steps:**
1. Answer all or some questions
2. Click "📤 Submit Exam"
3. Confirm in dialog
4. Wait for processing

**Expected Result:**
- [ ] Submit request succeeds (200 status)
- [ ] Results screen displays:
  - [ ] Green checkmark icon
  - [ ] Score (e.g., 40/50)
  - [ ] Percentage (80%)
  - [ ] Pass/Fail message
  - [ ] Correct/Wrong/Unanswered counts
  - [ ] Submission timestamp
  - [ ] Buttons: "Back to Dashboard" + "View More Exams"

---

### Test 10: Timer Expiration
**Steps:**
1. Create short exam (1 minute duration)
2. Start as student
3. Don't answer anything
4. Wait for timer to reach 00:00:00

**Expected Result:**
- [ ] Alert: "⏰ Time's up! Your exam has been auto-submitted."
- [ ] Exam auto-submits
- [ ] Results screen displays
- [ ] Status shows correct: 0/total

---

## Edge Case Testing

### Test: Multiple Attempts
- [ ] Student takes exam, submits
- [ ] Student takes exam again (attempt 2)
- [ ] Both attempts show in history

### Test: Max Attempts Exceeded
- [ ] Set maxAttempts = 1
- [ ] Student cannot start second attempt
- [ ] Button disabled, shows "No attempts remaining"

### Test: Outside Time Window
- [ ] Set exam start time to tomorrow
- [ ] Student cannot start exam
- [ ] Shows "Exam is not available yet"

### Test: Concurrent Tabs
- [ ] Open exam in Tab 1
- [ ] Click "Start Exam"
- [ ] Open same exam URL in Tab 2
- [ ] Should see same attempt (state synchronized)

### Test: Network Disconnect
- [ ] Close DevTools Network (throttle)
- [ ] Answer a question
- [ ] Turn off WiFi/network
- [ ] Try to answer another
- [ ] Turn network back on
- [ ] Auto-save recovers
- [ ] Continue exam

---

## Performance Testing

### Test: Load Time
- [ ] Navigate to "Exam Management": < 2s
- [ ] Load exam questions: < 1s
- [ ] Start exam attempt: < 1s
- [ ] Save answer: < 200ms
- [ ] Submit exam: < 2s

### Test: Concurrent Users
- [ ] 5 students start exam simultaneously
- [ ] All should succeed without error
- [ ] Timers independent
- [ ] No interference between students

---

## Security Testing

### Test: Authentication
- [ ] Cannot access `/api/exams/create` without token
- [ ] Returns 401 Unauthorized

### Test: Authorization
- [ ] Student cannot POST to `/api/exams/create`
- [ ] Returns 403 Forbidden
- [ ] Teacher cannot take student endpoint
- [ ] Returns 403 Forbidden

### Test: Data Isolation
- [ ] Student A cannot see Student B's attempt
- [ ] Teacher can only see own exams
- [ ] Answers are per-student isolated

---

## Verification Checklist

### Before Deployment
- [ ] All 25 files created
- [ ] Database migration run
- [ ] Backend compiles without errors
- [ ] Frontend builds without errors
- [ ] API endpoints respond
- [ ] 10 functional tests pass
- [ ] 5 edge cases handled
- [ ] Performance acceptable
- [ ] Security measures verified

### After Deployment
- [ ] Production database backed up
- [ ] Monitoring enabled (logs)
- [ ] SSL certificate installed (if HTTPS)
- [ ] Firewall rules configured
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured for frontend (if applicable)
- [ ] Backup schedule set up
- [ ] Disaster recovery plan documented

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Table doesn't exist" | Run migration script |
| "Connection refused" | Check MySQL is running |
| "Port 8080 already in use" | Kill existing process: `lsof -i :8080` |
| "Port 5173 already in use" | Use different port: `npm run dev -- --port 5174` |
| "CORS error" | Check backend CORS config, frontend origin |
| "Answers not saving" | Check network tab, verify backend logs |
| "Timer not counting" | Check system clock, browser console errors |
| "Exam not published" | Verify exam has ≥1 question before publishing |
| "Cannot start attempt" | Check time window and max attempts |
| "Score calculation wrong" | Verify negative_mark, MCQ correct option marked |

---

## Support Contacts

- **Database Issues**: Check `database_migration_exam_management.sql` in EXAM_MANAGEMENT_GUIDE.md
- **API Issues**: Check API Reference section in EXAM_MANAGEMENT_GUIDE.md
- **Frontend Issues**: Check frontend component documentation
- **General**: See QUICK_START_EXAM_MODULE.md for troubleshooting

---

## Sign-Off

**Deployment Ready**: ✅ Yes / ❌ No

**Checked By**: ___________________  
**Date**: ___________________  
**Notes**: ___________________________________________________

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Production Ready ✅

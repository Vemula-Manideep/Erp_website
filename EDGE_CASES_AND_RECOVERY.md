# 🔄 State Recovery & Edge Cases

## Problem: What Happens When...

### 1. **Student Refreshes Page During Exam**

**What Happens:**
```
1. Student refreshes → Page unloads
2. Frontend call to: GET /api/exams/{examId}/student/{studentId}
3. Backend returns:
   - Previously saved answers
   - Current question index
   - Violation count
   - Remaining time (recalculated from exam start time)
4. Frontend restores state from localStorage AND backend
5. Exam continues seamlessly
```

**Code Flow:**
```javascript
// ExamPanel.jsx - Initialization
useEffect(() => {
  const initializeExam = async () => {
    const response = await fetch(`/api/exams/${examId}/student/${studentId}`);
    const data = response.json();
    
    // Restore previous state
    if (data.savedAnswers) {
      setAnswers(data.savedAnswers);
      setCurrentQuestionIndex(data.currentQuestionIndex);
    }
    
    setTimeRemaining(data.remainingTime);
  };
}, [examId, studentId]);
```

---

### 2. **Network Connection Lost**

**What Happens:**
```
1. WebSocket connection drops
2. Frontend catches 'onclose' event
3. Attempts reconnection every 3 seconds
4. Meanwhile, auto-save still happens (HTTP fallback)
5. When reconnected, resumes violation reporting
```

**Code Flow:**
```javascript
// Automatic reconnection
ws.current.onclose = () => {
  console.log("⚠️ WebSocket disconnected");
  setTimeout(connectWebSocket, 3000);  // Retry after 3s
};

// HTTP fallback for auto-save
useEffect(() => {
  const autoSaveInterval = setInterval(saveExamState, 30000);  // Every 30s
  return () => clearInterval(autoSaveInterval);
}, [answers, currentQuestionIndex]);
```

---

### 3. **Multiple Browser Tabs Open**

**What Happens:**
```
1. Student opens exam in Tab A
2. Student opens same exam in Tab B
3. Both tabs get same exam session (database record)
4. BOTH detect violations → duplicates!

SOLUTION: Enforce single-tab access
```

**Recommended Fix:**
```javascript
// Add to ExamPanel.jsx
useEffect(() => {
  // Only one instance should be active
  const instanceId = Date.now();
  localStorage.setItem(`exam-${examId}-instance`, instanceId);
  
  const interval = setInterval(() => {
    const stored = localStorage.getItem(`exam-${examId}-instance`);
    if (stored !== String(instanceId)) {
      // Another tab is running this exam
      console.error("Exam already open in another tab!");
      setExamActive(false);
      alert("This exam is already open in another browser tab.");
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [examId]);
```

---

### 4. **Student Submits, Then Tries to Continue**

**What Happens:**
```
1. Student clicks "Submit"
2. Exam marked as COMPLETED in database
3. Frontend navigates away to dashboard
4. If student tries to reload: GET /api/exams/{examId}/student/{studentId}
5. Backend returns status: COMPLETED
6. Frontend shows: "Exam already submitted"
```

**Backend Check:**
```java
@GetMapping("/{examId}/student/{studentId}")
public ResponseEntity<?> getExamData(...) {
    StudentExam session = studentExamRepository
        .findByStudentIdAndExamId(studentId, examId)
        .orElseThrow();
    
    // Check if already completed
    if (session.getStatus() == StudentExam.ExamStatus.COMPLETED) {
        return ResponseEntity.status(409)  // Conflict
            .body(Map.of("error", "Exam already submitted"));
    }
    
    return ResponseEntity.ok(examData);
}
```

---

### 5. **Violation Threshold Reached Mid-Answer**

**What Happens:**
```
1. Student has typed long answer for current question
2. Violation #5 triggered (threshold breach)
3. Exam marked TERMINATED_BY_SYSTEM
4. Timer stops, buttons disabled
5. Previous answer is saved

NO DATA LOSS!
```

**Data Persistence:**
```java
// ProctoringService.java
public void reportViolation(...) {
    // ... validation logic ...
    
    // 1. Save the violation
    violation = violationRepository.save(violation);
    
    // 2. Update exam session
    session.setViolationCount(...);
    studentExamRepository.save(session);  // ✅ Saves current answers
    
    // 3. Check threshold
    if (session.getViolationCount() >= THRESHOLD) {
        terminateExamByViolations(...);  // Sets status = TERMINATED_BY_SYSTEM
    }
}
```

---

### 6. **Teacher Manually Terminates While Student is Answering**

**What Happens:**
```
1. Teacher clicks "Terminate" button
2. POST /api/exams/{examId}/terminate/{studentId}
3. Backend: exam status = TERMINATED_BY_TEACHER
4. WebSocket message sent to student: type = "EXAM_TERMINATED"
5. Student's frontend receives message
6. Frontend disables input, shows termination dialog
7. Exam data still saved (not lost)
```

**Real-time Update:**
```javascript
// ExamPanel.jsx - WebSocket handler
ws.current.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "EXAM_TERMINATED") {
    setExamTerminated(true);
    setExamActive(false);
    setWarningMessage("Your exam has been terminated by instructor");
  }
};
```

---

### 7. **Violation Count Discrepancy Between Client & Server**

**Scenario**: Student's frontend shows 3 violations, but server shows 5

**Prevention:**
```
1. Frontend tracks violations in state (for UI feedback)
2. Every violation sent to server AND saved via API
3. On exam init, frontend fetches SERVER violation count
4. Frontend respects server count as source of truth

Code in ExamPanel.jsx:
- Maintain local violationCountRef for UI
- Every 30s auto-save: send violationCount to backend
- On init: override local count with server count
```

```javascript
// Initialization
useEffect(() => {
  const response = await fetch(`/api/exams/${examId}/student/${studentId}`);
  const data = response.json();
  
  // Use server count as source of truth
  violationCountRef.current = data.violationCount;
  setViolationCount(data.violationCount);
}, []);
```

---

### 8. **Clock Skew (Server Time ≠ Client Time)**

**Problem**: Timer runs at different speeds

**Solution**: Calculate remaining time based on server start time

```javascript
// ExamPanel.jsx
const calculateRemainingTime = () => {
  if (!examStartTimeRef.current) return 0;
  
  const serverStartTime = new Date(examData.examStartTime).getTime();
  const examDurationMs = examData.durationMinutes * 60 * 1000;
  const elapsedMs = Date.now() - serverStartTime;
  const remainingMs = examDurationMs - elapsedMs;
  
  return Math.max(0, Math.ceil(remainingMs / 1000));
};
```

---

### 9. **Database Connection Lost During Exam**

**What Happens**:
```
1. Backend can't save violation to database
2. WebSocket still works (in-memory broker)
3. Frontend still receives alerts (but not persisted)
4. When DB comes back: violations are recorded

RISK: Some violations may be lost
```

**Mitigation:**
```java
@Transactional
public Violation reportViolation(...) {
    try {
        violation = violationRepository.save(violation);
    } catch (DatabaseException e) {
        log.error("Failed to save violation - DB down?", e);
        // Still notify frontend
        broadcastViolationAlert(...);  // May be lost if frontend doesn't retry
        // Queue for retry
        queueViolationForRetry(violation);
        throw e;
    }
}
```

---

### 10. **Malicious Student Sends Fake Violations**

**Security Risk**: Student spoofs violation report

**Current Defense**:
```
1. Backend validates examId and studentId exist
2. Backend checks exam is in ACTIVE status
3. WebSocket authenticated (if JWT implemented)

Improvements needed:
```

```java
@MessageMapping("/report-violation")
public void reportViolation(@Payload ViolationReportDTO report) {
    // 1. Extract user from WebSocket session
    Principal principal = SimpHeaderAccessor.wrap(message).getUser();
    String authenticatedUserId = principal.getName();
    
    // 2. Verify student can only report their own violations
    if (!authenticatedUserId.equals(report.getStudentId())) {
        throw new SecurityException("Unauthorized");
    }
    
    // 3. Verify exam exists and belongs to this student
    StudentExam session = studentExamRepository
        .findByStudentIdAndExamId(report.getStudentId(), report.getExamId())
        .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    
    // 4. Rate limit: max 1 violation per second
    if (System.currentTimeMillis() - lastViolationTime < 1000) {
        throw new RateLimitException("Too many violation reports");
    }
    
    // ... proceed with validation
}
```

---

## Configuration for Production

### **application-prod.yml**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 20000
  
  jpa:
    hibernate:
      ddl-auto: validate  # Don't auto-create tables
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true

server:
  compression:
    enabled: true
    min-response-size: 1024

app:
  exam:
    violation-threshold: 5
    critical-severity-threshold: 10
    violation-timeout-seconds: 3600  # Auto-clear old violations
    max-concurrent-exams-per-student: 1  # Prevent multi-tab abuse
```

---

## Monitoring & Alerts

### **Log Events to Monitor**

```bash
# Critical violations
grep "TERMINATING EXAM" app.log | wc -l

# Failed submissions
grep "Error submitting exam" app.log

# WebSocket disconnections
grep "WebSocket disconnected" app.log | wc -l

# Database errors
grep "DATABASE_ERROR" app.log
```

### **Prometheus Metrics (Optional)**

```java
@RestController
@Endpoint(id = "exam-metrics")
public class ExamMetricsEndpoint {
    
    @ReadOperation
    public Map<String, Object> examMetrics() {
        return Map.of(
            "active_exams", studentExamRepository.countActiveExams(),
            "total_violations_today", violationRepository.countByTimestampAfter(today),
            "auto_terminated_count", studentExamRepository.countTerminatedBySystem(),
            "avg_violations_per_exam", violationRepository.averageViolationsPerExam()
        );
    }
}
```

---

## Rollback Plan

If something goes wrong:

1. **Stop backend**: `systemctl stop college-erp`
2. **Restore from backup**: `mysql < backup.sql`
3. **Disable WebSocket** (temporary):
   ```java
   @Configuration
   public class DisableWebSocket {
       // Comment out @EnableWebSocketMessageBroker
   }
   ```
4. **Restart**: `systemctl start college-erp`

---

## Performance Optimization

### **High Volume (1000+ concurrent students)**

```java
// 1. Use Redis for message caching
@Bean
public MessageBrokerRegistry configureMessageBroker(...) {
    config.enableStompBrokerRelay("/topic", "/queue")
        .setRelayHost("redis-host")  // Use Redis broker
        .setRelayPort(61613);
}

// 2. Batch violation saves
@Scheduled(fixedDelay = 5000)
public void batchSaveViolations() {
    List<Violation> pending = violationQueue.drain();
    violationRepository.saveAll(pending);  // Batch insert
}

// 3. Connection pooling
@Bean
public JdbcTemplate jdbcTemplate(DataSource ds) {
    return new JdbcTemplate(ds);
}
```

---

**Last Updated**: 2024-01-15

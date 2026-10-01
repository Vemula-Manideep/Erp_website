# ⚡ Quick Start Guide

## 🚀 Get Running in 15 Minutes

### Prerequisites
- ✅ Java 11+ installed
- ✅ MySQL running
- ✅ Node.js 14+ installed
- ✅ Maven 3.6+

---

## STEP 1: Backend Setup (5 min)

```bash
# 1. Copy Java classes to your project
cp -r BackEnd/src/main/java/com/college/erp/* \
    your-project/src/main/java/com/college/erp/

# 2. Update pom.xml with WebSocket dependencies
# (Add content from BackEnd/pom-websocket-dependencies.xml)

# 3. Run database migration
mysql -u root -p your_database < Database/migrations/V1__Add_Proctoring_Module.sql

# 4. Start backend
cd your-project
mvn clean install
mvn spring-boot:run
```

**Verify**: `curl http://localhost:8080/` → Should get response

---

## STEP 2: Frontend Setup (5 min)

```bash
# 1. Copy React components
cp Fron-End/College-ERP/src/pages/dashboard/student/ExamPanel.jsx \
   your-frontend/src/pages/dashboard/student/

cp Fron-End/College-ERP/src/components/proctoring/TeacherAlertPanel.jsx \
   your-frontend/src/components/proctoring/

cp Fron-End/College-ERP/src/components/Toast.jsx \
   your-frontend/src/components/

# 2. Routes already updated in routes.jsx

# 3. Start frontend dev server
cd your-frontend
npm install  # (should be no-op)
npm run dev
```

**Verify**: Open `http://localhost:5173` → No errors

---

## STEP 3: Test It (5 min)

### Student Exam
```
1. Open: http://localhost:5173/
2. Login as student
3. Navigate to: /dashboard/student/exam/1
4. Exam panel should load
5. Try pressing F12 → Should show violation
6. After 5 violations → Exam auto-terminates
```

### Teacher Monitoring
```
1. Login as professor
2. Navigate to: /dashboard/professor/proctoring
3. Monitor violations in real-time
```

---

## 🎯 What's Working Now?

✅ Student can take secure proctored exam
✅ Real-time violation detection (6+ types)
✅ Auto-termination at threshold
✅ Teacher real-time alerts
✅ State recovery on refresh
✅ WebSocket communication

---

## 🔧 Configuration (if needed)

Edit `application.properties`:
```properties
# WebSocket
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/college_erp
spring.datasource.username=root
spring.datasource.password=password

# Exam settings
app.exam.violation-threshold=5
app.exam.critical-severity-threshold=10
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| WebSocket won't connect | Ensure backend is running on :8080 |
| Exams table not found | Run SQL migration manually |
| CORS errors | Check CORS config in WebSocketConfig |
| Violations not showing | Check if violations table created |

---

## 📚 Next Steps

1. **Integrate with your existing services**:
   - Update ProctoringService helper methods
   - Link to your Student and Exam entities

2. **Add JWT authentication** to WebSocket

3. **Test with load** (multiple concurrent exams)

4. **Deploy to production**

---

**That's it! 🎉 You now have a working proctored exam system!**

For detailed docs, see:
- `INTEGRATION_GUIDE.md` - Full setup & architecture
- `EDGE_CASES_AND_RECOVERY.md` - Advanced scenarios

package com.example.stud_erp.service;

import com.example.stud_erp.entity.Attendance;
import com.example.stud_erp.entity.ClassSession;
import com.example.stud_erp.entity.LateCount;
import com.example.stud_erp.entity.Student;
import com.example.stud_erp.payload.AttendanceEntryDTO;
import com.example.stud_erp.payload.AttendanceMarkRequest;
import com.example.stud_erp.repository.AttendanceRepository;
import com.example.stud_erp.repository.ClassRepository;
import com.example.stud_erp.repository.LateCountRepository;
import com.example.stud_erp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private ClassRepository classSessionRepository;

    @Autowired
    private AttendanceRepository attendanceRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LateCountRepository lateCountRepository;

    public ClassSession saveAttendance(AttendanceMarkRequest request) {
        ClassSession classSession = new ClassSession();
        classSession.setLecturer(request.getLecturer());
        classSession.setSubject(request.getSubject());
        classSession.setTime(LocalTime.parse(request.getTime()));

        List<Attendance> attendanceRecords = new ArrayList<>();
        LocalDate attendanceDate = LocalDate.parse(request.getAttendanceDate());

        for (AttendanceEntryDTO entry : request.getAttendanceList()) {
            Student student = null;
            if (entry.getStudentId() != null) {
                student = studentRepository.findById(entry.getStudentId()).orElse(null);
            } else if (entry.getStudentName() != null) {
                // Fallback for older data format
                String rollNoStr = entry.getStudentName().split(" - ")[0];
                try {
                    Long rollNo = Long.parseLong(rollNoStr);
                    student = studentRepository.findByStudRollNo(rollNo);
                } catch (Exception e) {
                    student = studentRepository.findByStudName(entry.getStudentName());
                }
            }

            if (student == null) {
                continue; // Skip if student not found
            }

            String status = entry.getStatus();
            boolean isLate = false;
            String checkInTime = null;

            if (status.startsWith("L:")) {
                isLate = true;
                checkInTime = status.substring(2);
                status = "L";
            } else if ("L".equals(status)) {
                isLate = true;
                checkInTime = entry.getCheckInTime();
            }

            Attendance record = new Attendance();
            record.setStudentName(student.getStudName());
            record.setStatus(status);
            record.setAttendanceDate(attendanceDate);
            record.setClassSession(classSession);
            record.setStudent(student);
            record.setLate(isLate);
            record.setCheckInTime(checkInTime);
            attendanceRecords.add(record);

            // Handle Late Count Rule
            if (isLate) {
                LateCount lateCount = lateCountRepository.findByStudentAndSubject(student, request.getSubject())
                        .orElse(new LateCount());
                
                if (lateCount.getStudent() == null) {
                    lateCount.setStudent(student);
                    lateCount.setSubject(request.getSubject());
                }
                
                lateCount.setCount(lateCount.getCount() + 1);
                
                // For every 10 late entries -> mark 1 absent automatically
                if (lateCount.getCount() % 10 == 0) {
                    Attendance autoAbsentRecord = new Attendance();
                    autoAbsentRecord.setStudentName(student.getStudName());
                    autoAbsentRecord.setStatus("A"); // Absent
                    autoAbsentRecord.setAttendanceDate(attendanceDate); // Same date
                    autoAbsentRecord.setClassSession(classSession);
                    autoAbsentRecord.setStudent(student);
                    autoAbsentRecord.setLate(false);
                    attendanceRecords.add(autoAbsentRecord);
                }
                
                lateCountRepository.save(lateCount);
            }
        }

        classSession.setAttendance(attendanceRecords);
        return classSessionRepository.save(classSession);
    }

    public Map<LocalDate, List<Attendance>> getAttendanceByLecturerAndSubject(String lecturer, String subject) {
        List<Attendance> records = attendanceRecordRepository.findByClassSessionLecturerAndClassSessionSubject(lecturer, subject);
        return records.stream().collect(Collectors.groupingBy(Attendance::getAttendanceDate));
    }

    public List<com.example.stud_erp.payload.AttendanceSummaryDTO> getAttendanceSummary(Long studentId) {
        List<Object[]> results = attendanceRecordRepository.findAttendanceSummaryByStudentId(studentId);
        List<com.example.stud_erp.payload.AttendanceSummaryDTO> summaryList = new ArrayList<>();
        
        String[] colors = {"indigo", "orange", "blue", "cyan", "rose", "purple", "green"};
        int colorIdx = 0;

        for (Object[] row : results) {
            String subject = (String) row[0];
            int total = ((Number) row[1]).intValue();
            int present = row[2] != null ? ((Number) row[2]).intValue() : 0;
            
            summaryList.add(new com.example.stud_erp.payload.AttendanceSummaryDTO(
                subject, total, present, colors[colorIdx % colors.length]
            ));
            colorIdx++;
        }

        return summaryList;
    }
}

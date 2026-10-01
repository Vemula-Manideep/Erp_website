package com.example.stud_erp.payload;

import lombok.Data;

@Data
public class AttendanceEntryDTO {
    private Long studentId;
    private String studentName;
    private String status; // "P", "A", or "L"
    private String checkInTime;
}

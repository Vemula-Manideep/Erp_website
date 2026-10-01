package com.example.stud_erp.payload;

import lombok.Data;
import java.util.List;

@Data
public class AttendanceMarkRequest {
    private String lecturer;
    private String subject;
    private String attendanceDate;
    private String time;
    private List<AttendanceEntryDTO> attendanceList;
}

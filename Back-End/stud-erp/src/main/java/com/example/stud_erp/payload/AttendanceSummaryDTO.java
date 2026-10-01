package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDTO {
    private String name; // Subject name
    private int total;
    private int present;
    private String color; // UI color representation
}

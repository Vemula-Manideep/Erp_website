package com.example.stud_erp.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private int totalStudents;
    private int totalProfessors;
    private int activeClassesToday;
}

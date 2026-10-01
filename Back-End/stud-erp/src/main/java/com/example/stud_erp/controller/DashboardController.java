package com.example.stud_erp.controller;

import com.example.stud_erp.payload.DashboardStatsDTO;
import com.example.stud_erp.repository.ProfessorRepository;
import com.example.stud_erp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        int totalStudents = (int) studentRepository.count();
        int totalProfessors = (int) professorRepository.count();
        int activeClassesToday = 15; // Placeholder for now, could be derived from ClassSession table
        
        return ResponseEntity.ok(new DashboardStatsDTO(totalStudents, totalProfessors, activeClassesToday));
    }
}

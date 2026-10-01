package com.example.stud_erp.configuration;

import com.example.stud_erp.entity.Professor;
import com.example.stud_erp.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class ProfessorDataLoader implements CommandLineRunner {

    @Autowired
    private ProfessorRepository professorRepository;

    @Override
    public void run(String... args) throws Exception {
        if (professorRepository.count() > 2) {
            return; // Already seeded
        }

        // Seed N Sujatha Guptha
        Professor p1 = new Professor();
        p1.setProfessorId("P001");
        p1.setName("N.Sujatha Guptha");
        p1.setSubject("WP");
        p1.setSubjects(Arrays.asList("WP"));
        p1.setDepartmentName("Computer Science");
        p1.setUsername("sujatha");
        p1.setPassword("password123");
        p1.setEmail("sujatha@example.com");

        // Seed G Mamatha
        Professor p2 = new Professor();
        p2.setProfessorId("P002");
        p2.setName("G.Mamatha");
        p2.setSubject("PAI");
        p2.setSubjects(Arrays.asList("PAI"));
        p2.setDepartmentName("Computer Science");
        p2.setUsername("mamatha");
        p2.setPassword("password123");
        p2.setEmail("mamatha@example.com");

        professorRepository.saveAll(Arrays.asList(p1, p2));

        System.out.println("========== Successfully seeded 2 professors into the database ==========");
    }
}

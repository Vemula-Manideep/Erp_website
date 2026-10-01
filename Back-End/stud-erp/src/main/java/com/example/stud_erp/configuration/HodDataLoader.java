package com.example.stud_erp.configuration;

import com.example.stud_erp.entity.HOD;
import com.example.stud_erp.repository.HODRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class HodDataLoader implements CommandLineRunner {

    @Autowired
    private HODRepository hodRepository;

    @Override
    public void run(String... args) throws Exception {
        if (hodRepository.count() > 0) {
            return; // Already seeded
        }

        HOD hod = new HOD();
        hod.setName("Dr. K. Radhika");
        hod.setDepartment("Computer Science");
        hod.setUsername("hod_cse");
        hod.setPassword("password123");
        hod.setEmail("hod_cse@example.com");
        hod.setPhone("9876543210");
        hod.setSubjects(Arrays.asList("CSE Core"));

        hodRepository.save(hod);

        System.out.println("========== Successfully seeded 1 HOD into the database ==========");
    }
}

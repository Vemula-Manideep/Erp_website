package com.example.stud_erp.repository;

import com.example.stud_erp.entity.LateCount;
import com.example.stud_erp.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LateCountRepository extends JpaRepository<LateCount, Long> {
    Optional<LateCount> findByStudentAndSubject(Student student, String subject);
}

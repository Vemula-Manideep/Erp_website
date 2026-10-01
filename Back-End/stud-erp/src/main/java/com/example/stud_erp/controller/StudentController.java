package com.example.stud_erp.controller;

import com.example.stud_erp.entity.Student;
import com.example.stud_erp.exception.CustomException;
import com.example.stud_erp.exception.OTPExpiredException;
import com.example.stud_erp.payload.ForgotPasswordRequest;
import com.example.stud_erp.payload.LoginRequest;
import com.example.stud_erp.payload.ResetPasswordRequest;
import com.example.stud_erp.payload.StudentDTO;
import com.example.stud_erp.repository.StudentRepository;
import com.example.stud_erp.service.ImageService;
import com.example.stud_erp.service.StudentService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;


    @Autowired
    private StudentService studentService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private ImageService ImageService;

    @PostMapping("/add-student")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile multipartFile,
                                         @RequestParam("studentId") String studentId,
                                         @RequestParam("username") String username,
                                         @RequestParam("password") String password,
                                         @RequestParam("email") String email,
                                         @RequestParam("name") String name,
                                         @RequestParam("fatherName") String fatherName,
                                         @RequestParam("lastName") String lastName,
                                         @RequestParam("age") int age,
                                         @RequestParam("dob") LocalDate dob,
                                         @RequestParam("caste") String caste,
                                         @RequestParam("category") String category,
                                         @RequestParam("major") String major,
                                         @RequestParam("roll-no") Long rollNo,
                                         @RequestParam("year") int year,
                                         @RequestParam("phone-number") String number) {
        try {
            // Combined existence checks into a single method call
            boolean exists = studentService.existsByUniqueFields(studentId, username, email, rollNo);
            if (exists) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("A student with the same ID, Roll Number, Username, or Email already exists.");
            }

            // Create the Student object
            Student student = new Student();
            student.setStudentId(studentId);
            student.setUsername(username);
            student.setPassword(password);
            student.setEmail(email);
            student.setStudName(name);
            student.setStudFatherName(fatherName);
            student.setStudLastName(lastName);
            student.setStudentAge(age);
            student.setStudentDob(dob);
            student.setMajor(major);
            student.setStudCaste(caste);
            student.setStudCategory(category);
            student.setStudRollNo(rollNo);
            student.setStudPhoneNumber(number);
            student.setYear(year);

            // Handle the image upload and save the student
            String imageUrl = imageService.uploadStudentData(multipartFile, student);
            student.setImageUrl(imageUrl);

            // Save the student object after uploading the image
            studentService.addStudent(student);

            return ResponseEntity.ok("Student data successfully uploaded");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading student data");
        }
    }


    @GetMapping
    public List<StudentDTO> getAllStudents() {
        return studentService.findAll();
    }

    // Alias endpoint used by the frontend erpApi.js
    @GetMapping("/get-students")
    public List<StudentDTO> getAllStudentsList() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student updatedStudent) {
        try {
            Student student = studentService.updateStudent(id, updatedStudent);
            return ResponseEntity.ok(student);
        } catch (CustomException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Simple JSON-based registration (no file upload) used by ApiStore.js
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, Object> body) {
        try {
            String username = String.valueOf(body.getOrDefault("username", "")).trim();
            String email    = String.valueOf(body.getOrDefault("email", "")).trim();
            String password = String.valueOf(body.getOrDefault("password", "")).trim();
            String name     = String.valueOf(body.getOrDefault("name", username)).trim();

            if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                return ResponseEntity.badRequest().body("Username, email and password are required.");
            }

            Student student = new Student();
            student.setUsername(username);
            student.setEmail(email);
            student.setPassword(password);
            student.setStudName(name.isEmpty() ? username : name);
            student.setStudentId(username);
            // Required fields - set defaults for registration
            student.setMajor(String.valueOf(body.getOrDefault("major", "Undeclared")));
            student.setYear(1);
            student.setStudRollNo(System.currentTimeMillis()); // unique placeholder
            student.setStudFatherName(String.valueOf(body.getOrDefault("fatherName", "N/A")));
            student.setStudLastName(String.valueOf(body.getOrDefault("lastName", "")));
            student.setStudPhoneNumber(String.valueOf(body.getOrDefault("phone", "0000000000")));
            student.setStudentDob(java.time.LocalDate.now());
            student.setStudCategory(String.valueOf(body.getOrDefault("category", "General")));
            student.setStudCaste(String.valueOf(body.getOrDefault("caste", "N/A")));
            student.setStudentAge(18);
            studentRepository.save(student);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student registered successfully");
            response.put("username", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Student authenticatedUser = studentService.authenticateUser(loginRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("id", authenticatedUser.getId());
            response.put("role", "STUDENT");
            response.put("username", authenticatedUser.getUsername());
            response.put("name", authenticatedUser.getStudName());

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + ex.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            studentService.sendForgotPasswordEmail(request.getEmail());
            return ResponseEntity.ok("OTP sent to your email successfully");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestParam String email, @RequestParam String otp) {
        try {
            studentService.verifyOTP(email, otp);
            return ResponseEntity.ok("OTP verified successfully");
        } catch (OTPExpiredException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("OTP verification failed: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            studentService.resetPassword(request);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }
}
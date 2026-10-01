package com.example.stud_erp.configuration;

import com.example.stud_erp.entity.Student;
import com.example.stud_erp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class StudentDataLoader implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the database has very few students to avoid duplicates
        if (studentRepository.count() > 30) {
            return;
        }

        List<String> rawStudents = Arrays.asList(
            "160124749001 - ADITI SANGHVI", "160124749002 - BANDARI SHARVANI",
            "160124749003 - CHALLA SRI MEDHA SADHANA", "160124749004 - CONJEEVARAM NIDHI",
            "160124749005 - DENDI BHAVYA REDDY", "160124749006 - DYAPA AASHRITHA REDDY",
            "160124749007 - GORRELA CHAITANYA PRIYA", "160124749008 - GUDURI ADHVIKA",
            "160124749009 - KADARLA RAMYASRI", "160124749010 - KHANDEKE RACHANA",
            "160124749011 - KHYATHI MALLULA", "160124749012 - MANGALI DEEKSHITHA",
            "160124749013 - MEDA VENKATA SRI LAKSHMI KEERTHANA", "160124749014 - NARAHARISETTI LAXMI TEJASREE",
            "160124749015 - NATALIE SASHA THADMALLA", "160124749016 - PASULA ANVITA REDDY",
            "160124749017 - RANGAPURI SANJANA", "160124749018 - SANDIREDDY GEETHIKA",
            "160124749019 - SRISHTI KEDIA", "160124749020 - TALAMALA ABHINAYA",
            "160124749021 - THATI VYSHALI", "160124749022 - ADEPU BHAVANI SRIMAN",
            "160124749023 - AKHIL KUMAR SITARAM", "160124749024 - ANTHATI ROSHAN",
            "160124749025 - AYYAGARI ANANTH", "160124749026 - BALAGONI DURGA VARA PRASAD",
            "160124749027 - BANDARU SAI SIDDARTHA VAMSHI", "160124749028 - BANOTH KALYAN KUMAR",
            "160124749029 - BHAGAVATULA SESHA SATWIK", "160124749030 - BHEEMIREDDY LEELA ARAVIND REDDY",
            "160124749031 - CHATLA PRANAY NIVAS", "160124749032 - CHOPPARA SRUNIK",
            "160124749033 - CHOPPARI TAJ RISHIK", "160124749034 - DHANAVATH LALU PRASAD",
            "160124749035 - DOMMETI RUTHWIK", "160124749036 - EMMADI NITHIN REDDY",
            "160124749037 - GUNTUPALLI KIRAN", "160124749038 - IBRAHIM SYED AHMED",
            "160124749039 - JALAPALLY VIKRAM SIDDARTH REDDY", "160124749040 - JANDHYALA SAI RAGHAVA SRI CHARAN",
            "160124749041 - JEEVAN REDDY MADADI", "160124749042 - JONNALA AKSHITH",
            "160124749043 - K SRI HARSHA", "160124749044 - KARRA MANIDEEP",
            "160124749045 - KASTURI RISHIKESH REDDY", "160124749046 - KATARAP CHANDRA SHEKAR",
            "160124749047 - MADDI VISHAL", "160124749048 - MADUPATHI GANESH",
            "160124749049 - MAILARAM ADARSH", "160124749050 - MANDADAPU MOKSHAGNA",
            "160124749051 - MAYANK NANDELLA", "160124749052 - MUBASHIR SHAHWEZ",
            "160124749053 - METTU SHRITAN", "160124749054 - PADE RACHIT KISHORE",
            "160124749055 - SHAIK SAMEER", "160124749056 - NIKHIL JUTTUKONDA",
            "160124749057 - TEJAVATH BHASKAR", "160124749058 - THALLA RAJESH",
            "160124749059 - TUGUTLA SAAII NAWA THEJ REDDY", "160124749060 - VALLATHAI RAKSHITH NAIR",
            "160124749061 - VANIPENTA NAGA ASWIN REDDY", "160124749062 - VED UTKOOR",
            "160124749063 - VEMULA MANIDEEP", "160124749064 - VIBHAV SHANKAR KAMMULA",
            "160124749301 - MANJUNATH VESHALA", "160124749302 - DUMPETI SATHWIK",
            "160124749303 - P VISHNU", "160124749304 - BANALA SADHIKA REDDY",
            "160124749305 - NOORJAHAN", "160124749306 - SYED FAIZ AHMED BASHA",
            "160124749307 - RATHNALA PRANIHA"
        );

        for (String raw : rawStudents) {
            String[] parts = raw.split(" - ");
            Long rollNo = Long.parseLong(parts[0].trim());
            String name = parts[1].trim();
            
            // Extract a reasonable first name and last name
            String[] nameParts = name.split(" ");
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Unknown";

            Student student = new Student();
            student.setStudRollNo(rollNo);
            student.setStudentId("S" + rollNo);
            student.setStudName(name);
            student.setUsername(firstName.toLowerCase() + rollNo.toString().substring(rollNo.toString().length() - 3));
            student.setPassword("password123"); // Default password
            student.setEmail(firstName.toLowerCase() + rollNo + "@example.com");
            student.setMajor("Computer Science");
            student.setYear(2);
            student.setStudFatherName("Unknown");
            student.setStudLastName(lastName);
            student.setStudPhoneNumber("0000000000");
            student.setStudentDob(LocalDate.of(2004, 1, 1));
            student.setStudCategory("General");
            student.setStudentAge(20);
            
            studentRepository.save(student);
        }
        
        System.out.println("========== Successfully seeded " + rawStudents.size() + " students into the database ==========");
    }
}

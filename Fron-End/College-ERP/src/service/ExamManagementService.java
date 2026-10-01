package com.college.erp.service;

import com.college.erp.dto.*;
import com.college.erp.entity.*;
import com.college.erp.repository.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ExamManagementService
 *
 * Handles all exam-related business logic:
 * - Exam creation, update, publish
 * - Question management
 * - Student exam attempts
 * - Answer evaluation
 * - Score calculation
 */
@Service
@AllArgsConstructor
@Transactional
public class ExamManagementService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final StudentExamAttemptRepository studentExamAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;

    private final Gson gson = new Gson();

    // ============= EXAM MANAGEMENT =============

    /**
     * Create a new exam
     */
    public ExamDTO createExam(ExamDTO examDTO) {
        Exam exam = examDTO.toEntity();
        exam = examRepository.save(exam);
        return ExamDTO.fromEntity(exam);
    }

    /**
     * Get exam by ID
     */
    public ExamDTO getExamById(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));
        return ExamDTO.fromEntity(exam);
    }

    /**
     * Get all exams for a teacher
     */
    public List<ExamDTO> getTeacherExams(Long teacherId) {
        List<Exam> exams = examRepository.findByTeacherId(teacherId);
        return exams.stream()
                .map(ExamDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get available exams for students
     */
    public List<ExamDTO> getAvailableExams() {
        LocalDateTime now = LocalDateTime.now();
        List<Exam> exams = examRepository.findAvailableExamsAtTime(now);
        return exams.stream()
                .map(ExamDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update exam
     */
    public ExamDTO updateExam(Long examId, ExamDTO examDTO) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        // Only allow updates if DRAFT
        if (!exam.getStatus().equals(Exam.ExamStatus.DRAFT)) {
            throw new IllegalStateException("Can only update DRAFT exams");
        }

        exam.setTitle(examDTO.getTitle());
        exam.setSubject(examDTO.getSubject());
        exam.setDescription(examDTO.getDescription());
        exam.setDuration(examDTO.getDuration());
        exam.setTotalMarks(examDTO.getTotalMarks());
        exam.setNegativeMark(examDTO.getNegativeMark());
        exam.setMaxAttempts(examDTO.getMaxAttempts());
        exam.setStartTime(examDTO.getStartTime());
        exam.setEndTime(examDTO.getEndTime());

        exam = examRepository.save(exam);
        return ExamDTO.fromEntity(exam);
    }

    /**
     * Publish exam (change status from DRAFT to PUBLISHED)
     */
    public ExamDTO publishExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        if (!exam.getStatus().equals(Exam.ExamStatus.DRAFT)) {
            throw new IllegalStateException("Only DRAFT exams can be published");
        }

        // Validate exam has questions
        Integer questionCount = questionRepository.countByExamId(examId);
        if (questionCount == null || questionCount == 0) {
            throw new IllegalStateException("Exam must have at least one question to publish");
        }

        exam.setStatus(Exam.ExamStatus.PUBLISHED);
        exam = examRepository.save(exam);
        return ExamDTO.fromEntity(exam);
    }

    /**
     * Delete exam (only if DRAFT)
     */
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        if (!exam.getStatus().equals(Exam.ExamStatus.DRAFT)) {
            throw new IllegalStateException("Can only delete DRAFT exams");
        }

        // Delete all associated questions and answers
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(examId);
        for (Question question : questions) {
            questionOptionRepository.deleteByQuestionId(question.getId());
        }
        questionRepository.deleteByExamId(examId);

        // Delete all attempts for this exam
        List<StudentExamAttempt> attempts = studentExamAttemptRepository.findByExamIdOrderByStudentId(examId);
        for (StudentExamAttempt attempt : attempts) {
            studentAnswerRepository.deleteByStudentExamAttemptId(attempt.getId());
            studentExamAttemptRepository.delete(attempt);
        }

        examRepository.delete(exam);
    }

    // ============= QUESTION MANAGEMENT =============

    /**
     * Add question to exam
     */
    public QuestionDTO addQuestion(Long examId, QuestionDTO questionDTO) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        Question question = questionDTO.toEntity();
        question.setExamId(examId);

        // Set order number
        Integer maxOrder = questionRepository.findByExamIdOrderByOrderNumber(examId).stream()
                .max(Comparator.comparingInt(Question::getOrderNumber))
                .map(Question::getOrderNumber)
                .orElse(-1);
        question.setOrderNumber(maxOrder + 1);

        question = questionRepository.save(question);

        // Add options if MCQ
        List<QuestionOption> options = new ArrayList<>();
        if (Question.QuestionType.MCQ.equals(question.getType()) && questionDTO.getOptions() != null) {
            for (int i = 0; i < questionDTO.getOptions().size(); i++) {
                QuestionOptionDTO optionDTO = questionDTO.getOptions().get(i);
                QuestionOption option = optionDTO.toEntity();
                option.setQuestionId(question.getId());
                option.setOrderNumber(i);
                option = questionOptionRepository.save(option);
                options.add(option);
            }
        }

        // Update question count in exam
        Integer totalQuestions = questionRepository.countByExamId(examId);
        exam.setQuestionCount(totalQuestions != null ? totalQuestions : 0);
        examRepository.save(exam);

        return QuestionDTO.fromEntity(question, options);
    }

    /**
     * Get all questions for an exam
     */
    public List<QuestionDTO> getExamQuestions(Long examId) {
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(examId);
        return questions.stream()
                .map(q -> {
                    List<QuestionOption> options = null;
                    if (Question.QuestionType.MCQ.equals(q.getType())) {
                        options = questionOptionRepository.findByQuestionIdOrderByOrderNumber(q.getId());
                    }
                    return QuestionDTO.fromEntity(q, options);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get questions for student (without correct answers revealed)
     */
    public List<QuestionDTO> getExamQuestionsForStudent(Long examId) {
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(examId);
        return questions.stream()
                .map(q -> {
                    List<QuestionOption> options = null;
                    if (Question.QuestionType.MCQ.equals(q.getType())) {
                        // Get options but hide correct answer
                        List<QuestionOption> allOptions = questionOptionRepository.findByQuestionIdOrderByOrderNumber(q.getId());
                        // We'll filter this in DTO
                        options = allOptions;
                    }
                    return QuestionDTO.fromEntity(q, options);
                })
                .collect(Collectors.toList());
    }

    /**
     * Update question
     */
    public QuestionDTO updateQuestion(Long questionId, QuestionDTO questionDTO) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        question.setQuestionText(questionDTO.getQuestionText());
        question.setMarks(questionDTO.getMarks());

        question = questionRepository.save(question);

        // Update options if MCQ
        List<QuestionOption> options = new ArrayList<>();
        if (Question.QuestionType.MCQ.equals(question.getType())) {
            questionOptionRepository.deleteByQuestionId(questionId);
            if (questionDTO.getOptions() != null) {
                for (int i = 0; i < questionDTO.getOptions().size(); i++) {
                    QuestionOptionDTO optionDTO = questionDTO.getOptions().get(i);
                    QuestionOption option = optionDTO.toEntity();
                    option.setQuestionId(questionId);
                    option.setOrderNumber(i);
                    option = questionOptionRepository.save(option);
                    options.add(option);
                }
            }
        }

        return QuestionDTO.fromEntity(question, options);
    }

    /**
     * Delete question
     */
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        Long examId = question.getExamId();

        // Delete options
        questionOptionRepository.deleteByQuestionId(questionId);

        // Delete answers
        List<StudentAnswer> answers = studentAnswerRepository.findByQuestionId(questionId);
        studentAnswerRepository.deleteAll(answers);

        // Delete question
        questionRepository.delete(question);

        // Update question count
        Integer totalQuestions = questionRepository.countByExamId(examId);
        Exam exam = examRepository.findById(examId).get();
        exam.setQuestionCount(totalQuestions != null ? totalQuestions : 0);
        examRepository.save(exam);
    }

    // ============= STUDENT EXAM ATTEMPTS =============

    /**
     * Start exam attempt
     */
    public StudentExamAttemptDTO startExamAttempt(Long examId, Long studentId) {
        // Check if exam exists and is published
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + examId));

        if (!exam.getStatus().equals(Exam.ExamStatus.PUBLISHED)) {
            throw new IllegalStateException("Exam is not published");
        }

        // Check time window
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime()) || now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("Exam is not available at this time");
        }

        // Check attempt limit
        Integer attemptCount = studentExamAttemptRepository.countByStudentIdAndExamId(studentId, examId);
        if (attemptCount >= exam.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempts reached for this exam");
        }

        // Check for existing in-progress attempt
        Optional<StudentExamAttempt> existingAttempt = studentExamAttemptRepository
                .findActiveAttempt(studentId, examId);
        if (existingAttempt.isPresent()) {
            return StudentExamAttemptDTO.fromEntity(existingAttempt.get());
        }

        // Create new attempt
        StudentExamAttempt attempt = new StudentExamAttempt();
        attempt.setStudentId(studentId);
        attempt.setExamId(examId);
        attempt.setStatus(StudentExamAttempt.AttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(now);
        attempt.setCorrectAnswers(0);
        attempt.setWrongAnswers(0);
        attempt.setUnansweredQuestions(0);
        attempt.setTotalScore(0.0);

        attempt = studentExamAttemptRepository.save(attempt);

        // Initialize student answers (empty)
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(examId);
        for (Question question : questions) {
            StudentAnswer answer = new StudentAnswer();
            answer.setStudentExamAttemptId(attempt.getId());
            answer.setQuestionId(question.getId());
            answer.setIsEvaluated(false);
            studentAnswerRepository.save(answer);
        }

        return StudentExamAttemptDTO.fromEntity(attempt);
    }

    /**
     * Get active attempt for student
     */
    public StudentExamAttemptDTO getActiveAttempt(Long examId, Long studentId) {
        Optional<StudentExamAttempt> attempt = studentExamAttemptRepository
                .findActiveAttempt(studentId, examId);

        if (attempt.isEmpty()) {
            throw new IllegalArgumentException("No active attempt found");
        }

        return StudentExamAttemptDTO.fromEntity(attempt.get());
    }

    /**
     * Save student answer (called periodically during exam)
     */
    public void saveAnswer(Long studentExamAttemptId, Long questionId, Long selectedOptionId, String descriptiveAnswer) {
        StudentAnswer answer = studentAnswerRepository
                .findByStudentExamAttemptIdAndQuestionId(studentExamAttemptId, questionId)
                .orElseThrow(() -> new IllegalArgumentException("Answer record not found"));

        if (selectedOptionId != null) {
            answer.setSelectedOptionId(selectedOptionId);
        }
        if (descriptiveAnswer != null) {
            answer.setDescriptiveAnswer(descriptiveAnswer);
        }

        studentAnswerRepository.save(answer);

        // Update attempt's savedAnswers JSON
        updateAttemptAnswersJSON(studentExamAttemptId);
    }

    /**
     * Update the savedAnswers JSON in the attempt
     */
    private void updateAttemptAnswersJSON(Long studentExamAttemptId) {
        StudentExamAttempt attempt = studentExamAttemptRepository.findById(studentExamAttemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExamAttemptId(studentExamAttemptId);
        Map<String, Object> answersMap = new HashMap<>();

        for (StudentAnswer answer : answers) {
            Map<String, Object> answerData = new HashMap<>();
            if (answer.getSelectedOptionId() != null) {
                answerData.put("selectedOptionId", answer.getSelectedOptionId());
            }
            if (answer.getDescriptiveAnswer() != null) {
                answerData.put("descriptiveAnswer", answer.getDescriptiveAnswer());
            }
            answersMap.put(answer.getQuestionId().toString(), answerData);
        }

        attempt.setSavedAnswers(gson.toJson(answersMap));
        studentExamAttemptRepository.save(attempt);
    }

    /**
     * Submit exam and evaluate answers
     */
    public ExamResultDTO submitExam(Long studentExamAttemptId) {
        StudentExamAttempt attempt = studentExamAttemptRepository.findById(studentExamAttemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        // Mark as submitted
        attempt.setStatus(StudentExamAttempt.AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());

        // Get exam details
        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        // Get all answers and evaluate
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentExamAttemptId(studentExamAttemptId);
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(exam.getId());

        double totalScore = 0;
        int correctAnswers = 0;
        int wrongAnswers = 0;
        int unanswered = 0;

        for (Question question : questions) {
            Optional<StudentAnswer> answerOpt = answers.stream()
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .findFirst();

            if (answerOpt.isEmpty() || (answerOpt.get().getSelectedOptionId() == null && answerOpt.get().getDescriptiveAnswer() == null)) {
                unanswered++;
                continue;
            }

            StudentAnswer answer = answerOpt.get();

            if (question.getType().equals(Question.QuestionType.MCQ)) {
                // Auto-evaluate MCQ
                QuestionOption correctOption = questionOptionRepository
                        .findByQuestionIdAndIsCorrectTrue(question.getId());

                if (correctOption != null && correctOption.getId().equals(answer.getSelectedOptionId())) {
                    answer.setMarksAwarded(question.getMarks().doubleValue());
                    answer.setIsEvaluated(true);
                    totalScore += question.getMarks();
                    correctAnswers++;
                } else {
                    answer.setMarksAwarded(-exam.getNegativeMark());
                    answer.setIsEvaluated(true);
                    totalScore -= exam.getNegativeMark();
                    wrongAnswers++;
                }
            } else {
                // Descriptive - mark as pending evaluation
                answer.setIsEvaluated(false);
                unanswered++;
            }

            studentAnswerRepository.save(answer);
        }

        attempt.setCorrectAnswers(correctAnswers);
        attempt.setWrongAnswers(wrongAnswers);
        attempt.setUnansweredQuestions(unanswered);
        attempt.setTotalScore(Math.max(0, totalScore)); // Ensure non-negative

        studentExamAttemptRepository.save(attempt);

        // Return result
        return ExamResultDTO.builder()
                .studentExamAttemptId(studentExamAttemptId)
                .examId(exam.getId())
                .studentId(attempt.getStudentId())
                .totalScore(attempt.getTotalScore())
                .totalQuestions(questions.size())
                .correctAnswers(correctAnswers)
                .wrongAnswers(wrongAnswers)
                .unansweredQuestions(unanswered)
                .percentage((attempt.getTotalScore() / exam.getTotalMarks()) * 100)
                .status(attempt.getTotalScore() >= (exam.getTotalMarks() * 0.4) ? "PASS" : "FAIL")
                .submittedAt(attempt.getSubmittedAt().toString())
                .build();
    }

    /**
     * Get exam result
     */
    public ExamResultDTO getExamResult(Long studentExamAttemptId) {
        StudentExamAttempt attempt = studentExamAttemptRepository.findById(studentExamAttemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        Exam exam = examRepository.findById(attempt.getExamId()).get();
        List<Question> questions = questionRepository.findByExamIdOrderByOrderNumber(exam.getId());

        return ExamResultDTO.builder()
                .studentExamAttemptId(studentExamAttemptId)
                .examId(exam.getId())
                .studentId(attempt.getStudentId())
                .totalScore(attempt.getTotalScore())
                .totalQuestions(questions.size())
                .correctAnswers(attempt.getCorrectAnswers())
                .wrongAnswers(attempt.getWrongAnswers())
                .unansweredQuestions(attempt.getUnansweredQuestions())
                .percentage((attempt.getTotalScore() / exam.getTotalMarks()) * 100)
                .status(attempt.getTotalScore() >= (exam.getTotalMarks() * 0.4) ? "PASS" : "FAIL")
                .submittedAt(attempt.getSubmittedAt().toString())
                .build();
    }

    /**
     * Get all attempts for a student
     */
    public List<StudentExamAttemptDTO> getStudentAttempts(Long studentId) {
        List<StudentExamAttempt> attempts = studentExamAttemptRepository.findByStudentIdOrderByStartedAtDesc(studentId);
        return attempts.stream()
                .map(StudentExamAttemptDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all attempts for an exam (teacher view)
     */
    public List<StudentExamAttemptDTO> getExamAttempts(Long examId) {
        List<StudentExamAttempt> attempts = studentExamAttemptRepository.findByExamIdOrderByStudentId(examId);
        return attempts.stream()
                .map(StudentExamAttemptDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private StudentAnswer findByQuestionId(Long questionId) {
        return null;
    }
}

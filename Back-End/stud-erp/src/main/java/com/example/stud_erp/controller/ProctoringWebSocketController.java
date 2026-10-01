package com.example.stud_erp.controller;

import com.example.stud_erp.entity.Violation;
import com.example.stud_erp.repository.ViolationRepository;
import com.example.stud_erp.configuration.ViolationReportDTO;
import com.example.stud_erp.service.ProctoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket Controller for Real-time Proctoring
 * 
 * Handles incoming violation reports via WebSocket
 * and broadcasts alerts to teachers
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ProctoringWebSocketController {
    
    private final ProctoringService proctoringService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle incoming violation reports from students
     * 
     * Client sends: /app/report-violation
     * Message format:
     * {
     *   "examId": 123,
     *   "studentId": 456,
     *   "type": "TAB_SWITCH",
     *   "severity": "HIGH",
     *   "description": "Student switched to another tab"
     * }
     */
    @MessageMapping("/report-violation")
    public void reportViolation(@Payload ViolationReportDTO violationReport) {
        log.info("🚨 Violation received via WebSocket: {}", violationReport);
        
        try {
            // Validate and save violation
            Violation violation = proctoringService.reportViolation(
                violationReport.getExamId(),
                violationReport.getStudentId(),
                violationReport
            );
            
            if (violation != null) {
                // Send confirmation to student
                Map<String, Object> response = new HashMap<>();
                response.put("type", "VIOLATION_RECEIVED");
                response.put("violationId", violation.getId());
                response.put("status", "recorded");
                
                messagingTemplate.convertAndSend(
                    "/user/" + violationReport.getStudentId() + "/queue/violations",
                    response
                );
                
                log.info("✅ Violation processed and confirmed to student");
            }
        } catch (Exception e) {
            log.error("❌ Error processing violation", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("type", "ERROR");
            errorResponse.put("message", "Failed to record violation");
            
            messagingTemplate.convertAndSend(
                "/user/" + violationReport.getStudentId() + "/queue/violations",
                errorResponse
            );
        }
    }
    
    /**
     * Handle exam state updates
     */
    @MessageMapping("/update-exam-state")
    public void updateExamState(@Payload Map<String, Object> stateUpdate) {
        log.debug("📝 Exam state update: {}", stateUpdate);
        
        Long examId = ((Number) stateUpdate.get("examId")).longValue();
        Long studentId = ((Number) stateUpdate.get("studentId")).longValue();
        
        // This could be used for periodic state syncing
        // Implement based on your requirements
    }
    
    /**
     * Health check for WebSocket connection
     */
    @MessageMapping("/ping")
    public void ping(@Payload Map<String, String> message) {
        log.debug("🔔 Ping from student");
        
        Map<String, String> pong = new HashMap<>();
        pong.put("type", "PONG");
        pong.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        messagingTemplate.convertAndSend(
            "/user/queue/ping",
            pong
        );
    }
}

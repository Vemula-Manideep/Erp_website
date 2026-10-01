package com.example.stud_erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // Without JWT, this endpoint is not used for session validation.
        // The frontend uses localStorage for role/user tracking.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Auth check not required - using localStorage");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // No cookie/token to clear - frontend just clears localStorage
        return ResponseEntity.ok("Logged out successfully");
    }
}

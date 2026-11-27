package com.mechanicsoft.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final EntityManager entityManager;

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        entityManager.createNativeQuery("SELECT 1").getSingleResult();
        Map<String, String> body = new HashMap<>();
        body.put("status", "UP");
        body.put("database", "CONNECTED");
        return ResponseEntity.ok(body);
    }
}
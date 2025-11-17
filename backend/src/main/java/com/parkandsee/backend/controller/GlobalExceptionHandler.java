package com.parkandsee.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        System.out.println("=== ERREUR DE VALIDATION ===");
        
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldName = error.getField();
            String errorMessage = error.getDefaultMessage();
            String rejectedValue = String.valueOf(error.getRejectedValue());
            
            System.out.println("Champ en erreur: " + fieldName);
            System.out.println("Valeur rejetée: " + rejectedValue);
            System.out.println("Message d'erreur: " + errorMessage);
            System.out.println("---");
            
            errors.put(fieldName, errorMessage + " (valeur: " + rejectedValue + ")");
        });
        
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", 400);
        response.put("error", "Validation Failed");
        response.put("message", "Erreur de validation des données");
        response.put("details", errors);
        response.put("path", "/api/parking/reserve");
        
        System.out.println("Réponse d'erreur envoyée: " + response);
        System.out.println("===============================");
        
        return ResponseEntity.badRequest().body(response);
    }
}
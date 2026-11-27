package com.mechanicsoft.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Datos inválidos en la solicitud");
        Map<String, String> body = new HashMap<>();
        body.put("message", mensaje);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDuplicate(DataIntegrityViolationException ex) {
        String detalle = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        String mensaje;

        if (detalle.contains("uk_cliente_taller_telefono")) {
            mensaje = "Ya existe un cliente registrado con ese teléfono en este taller.";
        } else if (detalle.contains("uk_vehiculo_taller_placa")) {
            mensaje = "Ya existe una motocicleta registrada con esa placa en este taller.";
        } else {
            mensaje = "Error de integridad en base de datos: " + detalle;
        }

        Map<String, String> body = new HashMap<>();
        body.put("message", mensaje);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleStatus(ResponseStatusException ex) {
        String mensaje = ex.getReason() != null ? ex.getReason() : "Error procesando la solicitud";
        Map<String, String> body = new HashMap<>();
        body.put("message", mensaje);
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Error procesando la solicitud");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
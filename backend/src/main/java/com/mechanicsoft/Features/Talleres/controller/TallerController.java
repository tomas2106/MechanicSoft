package com.mechanicsoft.Features.Talleres.controller;

import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import com.mechanicsoft.Features.OrdenesServicio.repository.OrdenServicioRepository;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TallerController {

    private final TallerRepository tallerRepository;
    private final OrdenServicioRepository ordenRepository;

    // Login de taller (y auto-registro inicial si es el primer acceso)
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        return tallerRepository.findByEmailAndActivoTrue(email)
                .map(taller -> {
                    if (!taller.getPassword().equals(password)) {
                        return ResponseEntity.status(401).body(Map.of("message", "Contraseña incorrecta"));
                    }
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("token", UUID.randomUUID().toString());
                    resp.put("usuario", Map.of("nombre", taller.getNombre(), "email", taller.getEmail()));
                    resp.put("taller", taller);
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Taller no encontrado")));
    }

    // Registrar nuevo taller (SaaS Multi-taller)
    @PostMapping("/public/talleres/registro")
    public ResponseEntity<Taller> registrarTaller(@RequestBody Taller taller) {
        if (taller.getSlug() == null || taller.getSlug().isBlank()) {
            taller.setSlug(taller.getNombre().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        return ResponseEntity.ok(tallerRepository.save(taller));
    }

    @GetMapping("/public/talleres")
    public List<Taller> listarTalleres() {
        return tallerRepository.findByActivoTrue();
    }

    @GetMapping("/public/talleres/{slug}")
    public ResponseEntity<Taller> obtenerPorSlug(@PathVariable String slug) {
        return tallerRepository.findBySlugAndActivoTrue(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/talleres/{id}")
    public ResponseEntity<Taller> actualizarTaller(@PathVariable Long id, @RequestBody Taller datos) {
        return tallerRepository.findById(id).map(t -> {
            t.setNombre(datos.getNombre());
            t.setSlug(datos.getSlug());
            t.setUbicacion(datos.getUbicacion());
            t.setWhatsapp(datos.getWhatsapp());
            if (datos.getLogoUrl() != null) t.setLogoUrl(datos.getLogoUrl());
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Consulta pública para el cliente por WhatsApp o Placa
    @GetMapping("/public/consulta")
    public ResponseEntity<?> consultarMoto(
            @RequestParam(defaultValue = "general") String taller,
            @RequestParam String q) {

        String query = q.trim().toUpperCase();
        return ordenRepository.findAll().stream()
                .filter(o -> Boolean.TRUE.equals(o.getActivo()))
                .filter(o -> {
                    String placa = o.getVehiculo().getPlaca().toUpperCase();
                    String tel = o.getVehiculo().getCliente().getTelefono();
                    return placa.equals(query) || tel.contains(q.trim());
                })
                .reduce((first, second) -> second) // Toma la orden más reciente
                .map(orden -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", orden.getId());
                    dto.put("estado", orden.getEstado());
                    dto.put("motivoIngreso", orden.getMotivoIngreso());
                    dto.put("diagnostico", orden.getDiagnostico());
                    dto.put("trabajoRealizado", orden.getTrabajoRealizado());
                    dto.put("valorTotal", orden.getValorTotal());
                    dto.put("fechaIngreso", orden.getFechaIngreso());
                    dto.put("placa", orden.getVehiculo().getPlaca());
                    dto.put("marca", orden.getVehiculo().getMarca());
                    dto.put("modelo", orden.getVehiculo().getModelo());
                    dto.put("fotoVehiculo", orden.getVehiculo().getFotoVehiculo());
                    return ResponseEntity.ok((Object) dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
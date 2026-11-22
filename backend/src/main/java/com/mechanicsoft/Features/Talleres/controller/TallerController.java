package com.mechanicsoft.Features.Talleres.controller;

import com.mechanicsoft.Features.OrdenesServicio.repository.OrdenServicioRepository;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.entity.UsuarioTaller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import com.mechanicsoft.Features.Talleres.repository.UsuarioTallerRepository;
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
    private final UsuarioTallerRepository usuarioRepository;
    private final OrdenServicioRepository ordenRepository;

    // Login unificado (Super Admin, Admin de Taller o Mecánico)
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        String password = credenciales.get("password");

        return usuarioRepository.findByEmailAndActivoTrue(email)
                .map(usuario -> {
                    if (!usuario.getPassword().equals(password)) {
                        return ResponseEntity.status(401).body(Map.of("message", "Contraseña incorrecta"));
                    }
                    if (usuario.getTaller() != null && !Boolean.TRUE.equals(usuario.getTaller().getActivo())) {
                        return ResponseEntity.status(403).body(Map.of("message", "Este taller se encuentra suspendido. Contacta a soporte."));
                    }

                    Map<String, Object> resp = new HashMap<>();
                    resp.put("token", UUID.randomUUID().toString());
                    resp.put("usuario", Map.of(
                            "id", usuario.getId(),
                            "nombre", usuario.getNombre(),
                            "email", usuario.getEmail(),
                            "rol", usuario.getRol(),
                            "esMecanico", usuario.getEsMecanico()
                    ));
                    resp.put("taller", usuario.getTaller());
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado")));
    }

    // --- ENDPOINTS EXCLUSIVOS SUPER ADMIN ---
    @GetMapping("/superadmin/talleres")
    public List<Taller> listarTodosTalleres() {
        return tallerRepository.findAll();
    }

    @PostMapping("/superadmin/talleres")
    public ResponseEntity<?> crearTallerYDueño(@RequestBody Map<String, Object> payload) {
        String nombreTaller = (String) payload.get("nombreTaller");
        String nombreAdmin = (String) payload.get("nombreAdmin");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String ubicacion = (String) payload.getOrDefault("ubicacion", "");
        String whatsapp = (String) payload.getOrDefault("whatsapp", "");
        boolean esMecanico = Boolean.TRUE.equals(payload.get("esMecanico"));

        String slug = nombreTaller.toLowerCase().trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        Taller taller = new Taller();
        taller.setNombre(nombreTaller);
        taller.setSlug(slug);
        taller.setEmail(email);
        taller.setPassword(password);
        taller.setUbicacion(ubicacion);
        taller.setWhatsapp(whatsapp);
        taller.setActivo(true);
        Taller tallerGuardado = tallerRepository.save(taller);

        UsuarioTaller admin = new UsuarioTaller();
        admin.setNombre(nombreAdmin);
        admin.setEmail(email);
        admin.setPassword(password);
        admin.setRol("ADMIN_TALLER");
        admin.setEsMecanico(esMecanico);
        admin.setTaller(tallerGuardado);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        return ResponseEntity.ok(tallerGuardado);
    }

    @PatchMapping("/superadmin/talleres/{id}/estado")
    public ResponseEntity<Taller> alternarEstadoTaller(@PathVariable Long id) {
        return tallerRepository.findById(id).map(t -> {
            t.setActivo(!Boolean.TRUE.equals(t.getActivo()));
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- GESTIÓN DE TRABAJADORES DENTRO DE UN TALLER ---
    @GetMapping("/talleres/{tallerId}/equipo")
    public List<UsuarioTaller> listarEquipo(@PathVariable Long tallerId) {
        return usuarioRepository.findByTallerIdAndActivoTrue(tallerId);
    }

    @PostMapping("/talleres/{tallerId}/equipo")
    public ResponseEntity<?> crearTrabajador(
            @PathVariable Long tallerId,
            @RequestBody UsuarioTaller nuevo) {
        return tallerRepository.findById(tallerId).map(taller -> {
            nuevo.setTaller(taller);
            nuevo.setActivo(true);
            if (nuevo.getRol() == null) nuevo.setRol("MECANICO");
            return ResponseEntity.ok((Object) usuarioRepository.save(nuevo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/talleres/equipo/{usuarioId}")
    public ResponseEntity<?> desactivarTrabajador(@PathVariable Long usuarioId) {
        return usuarioRepository.findById(usuarioId).map(u -> {
            u.setActivo(false);
            usuarioRepository.save(u);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ENDPOINTS PÚBLICOS Y PERFIL DEL TALLER ---
    @GetMapping("/public/talleres")
    public List<Taller> listarTalleresPublicos() {
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
                .reduce((first, second) -> second)
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
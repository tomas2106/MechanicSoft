package com.mechanicsoft.Features.Talleres.controller;

import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
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

    // Consulta pública con orden actual + historial completo de mantenimientos
    @GetMapping("/public/consulta")
    public ResponseEntity<?> consultarMoto(
            @RequestParam(defaultValue = "general") String taller,
            @RequestParam String q) {

        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ingresa una placa o teléfono"));
        }

        String query = q.trim().toUpperCase();
        String telQuery = q.trim().replaceAll("\\D+", "");

        List<OrdenServicio> coincidencias = ordenRepository.findAll().stream()
                .filter(o -> o != null && !Boolean.FALSE.equals(o.getActivo()))
                .filter(o -> o.getVehiculo() != null)
                .filter(o -> {
                    String placa = o.getVehiculo().getPlaca() != null
                            ? o.getVehiculo().getPlaca().replaceAll("\\s+", "").toUpperCase()
                            : "";
                    String tel = (o.getVehiculo().getCliente() != null && o.getVehiculo().getCliente().getTelefono() != null)
                            ? o.getVehiculo().getCliente().getTelefono().replaceAll("\\D+", "")
                            : "";
                    boolean matchPlaca = !placa.isEmpty() && placa.equals(query.replaceAll("\\s+", ""));
                    boolean matchTel = !telQuery.isEmpty() && !tel.isEmpty() && tel.contains(telQuery);
                    return matchPlaca || matchTel;
                })
                .sorted((a, b) -> Long.compare(
                        b.getId() != null ? b.getId() : 0L,
                        a.getId() != null ? a.getId() : 0L
                ))
                .toList();

        if (coincidencias.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OrdenServicio actual = coincidencias.get(0);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", actual.getId());
        dto.put("estado", actual.getEstado() != null ? actual.getEstado().name() : "RECIBIDO");
        dto.put("motivoIngreso", actual.getMotivoIngreso());
        dto.put("diagnostico", actual.getDiagnostico());
        dto.put("trabajoRealizado", actual.getTrabajoRealizado());
        dto.put("valorTotal", actual.getValorTotal());
        dto.put("diasGarantia", actual.getDiasGarantia() != null ? actual.getDiasGarantia() : 30);
        dto.put("fechaIngreso", actual.getFechaIngreso());
        dto.put("kilometrajeIngreso", actual.getKilometrajeIngreso());
        dto.put("placa", actual.getVehiculo().getPlaca());
        dto.put("marca", actual.getVehiculo().getMarca());
        dto.put("modelo", actual.getVehiculo().getModelo());
        dto.put("fotoVehiculo", actual.getVehiculo().getFotoVehiculo());

        List<Map<String, Object>> historial = coincidencias.stream().map(o -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", o.getId());
            item.put("fechaIngreso", o.getFechaIngreso());
            item.put("kilometrajeIngreso", o.getKilometrajeIngreso());
            item.put("motivoIngreso", o.getMotivoIngreso());
            item.put("diagnostico", o.getDiagnostico());
            item.put("trabajoRealizado", o.getTrabajoRealizado());
            item.put("valorTotal", o.getValorTotal());
            item.put("estado", o.getEstado() != null ? o.getEstado().name() : "RECIBIDO");
            return item;
        }).toList();

        dto.put("historial", historial);
        return ResponseEntity.ok(dto);
    }
}
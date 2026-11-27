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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SuppressWarnings({"rawtypes", "unchecked"})
public class TallerController {

    private final TallerRepository tallerRepository;
    private final UsuarioTallerRepository usuarioRepository;
    private final OrdenServicioRepository ordenRepository;

    private final Map citasPorTaller = new HashMap();
    private final List planesConfigurados = crearPlanesIniciales();

    private static List crearPlanesIniciales() {
        List lista = new ArrayList();

        Map mensual = new HashMap();
        mensual.put("codigo", "MENSUAL");
        mensual.put("nombre", "Plan Mensual Operativo");
        mensual.put("periodicidad", "Mensual");
        mensual.put("precioTexto", "$65.000 COP / mes");
        mensual.put("descripcion", "Jornada diaria, cierre de caja, historial por moto, citas y WhatsApp +57.");
        mensual.put("incluyeInventario", true);
        lista.add(mensual);

        Map anual = new HashMap();
        anual.put("codigo", "ANUAL");
        anual.put("nombre", "Plan Anual Taller Pro");
        anual.put("periodicidad", "Anual");
        anual.put("precioTexto", "$620.000 COP / año");
        anual.put("descripcion", "Todos los módulos operativos, inventario y ventas, métricas y ahorro anual.");
        anual.put("incluyeInventario", true);
        lista.add(anual);

        return lista;
    }

    private String normalizarColombia(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String digits = raw.replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return "";
        }
        if (digits.startsWith("57") && digits.length() >= 12) {
            return digits;
        }
        return "57" + digits;
    }

    private String obtenerTecnicoPrincipal(Long tallerId, Taller taller) {
        if (tallerId != null) {
            List equipo = usuarioRepository.findByTallerIdAndActivoTrue(tallerId);
            if (equipo != null && !equipo.isEmpty()) {
                for (Object obj : equipo) {
                    UsuarioTaller u = (UsuarioTaller) obj;
                    if (Boolean.TRUE.equals(u.getEsMecanico()) || "MECANICO".equalsIgnoreCase(u.getRol())) {
                        return u.getNombre();
                    }
                }
                UsuarioTaller primero = (UsuarioTaller) equipo.get(0);
                return primero.getNombre();
            }
        }
        if (taller != null && taller.getNombre() != null) {
            return "Técnico " + taller.getNombre();
        }
        return "Técnico asignado";
    }

    @PostMapping("/auth/login")
    public ResponseEntity login(@RequestBody Map credenciales) {
        String email = credenciales.get("email") != null ? String.valueOf(credenciales.get("email")).trim() : "";
        String password = credenciales.get("password") != null ? String.valueOf(credenciales.get("password")) : "";

        Optional opt = usuarioRepository.findByEmailAndActivoTrue(email);
        if (opt.isEmpty()) {
            opt = usuarioRepository.findByEmailAndActivoTrue(email.toLowerCase());
        }

        if (opt.isPresent()) {
            UsuarioTaller usuario = (UsuarioTaller) opt.get();
            if (!usuario.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of("message", "Contraseña incorrecta"));
            }
            if (usuario.getTaller() != null && !Boolean.TRUE.equals(usuario.getTaller().getActivo())) {
                return ResponseEntity.status(403).body(Map.of("message", "Este taller se encuentra suspendido. Contacta a soporte."));
            }

            Map usuarioDto = new HashMap();
            usuarioDto.put("id", usuario.getId());
            usuarioDto.put("nombre", usuario.getNombre());
            usuarioDto.put("email", usuario.getEmail());
            usuarioDto.put("rol", usuario.getRol());
            usuarioDto.put("esMecanico", usuario.getEsMecanico());
            usuarioDto.put("tecnicoNombre", obtenerTecnicoPrincipal(
                    usuario.getTaller() != null ? usuario.getTaller().getId() : null,
                    usuario.getTaller()
            ));

            Map resp = new HashMap();
            resp.put("token", UUID.randomUUID().toString());
            resp.put("usuario", usuarioDto);
            resp.put("taller", usuario.getTaller());
            return ResponseEntity.ok(resp);
        }

        return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
    }

    // --- PLANES MENSUALES Y ANUALES ---
    @GetMapping("/public/planes")
    public List listarPlanesPublicos() {
        return planesConfigurados;
    }

    @PutMapping("/superadmin/planes")
    public ResponseEntity actualizarPlanes(@RequestBody List nuevosPlanes) {
        if (nuevosPlanes != null && !nuevosPlanes.isEmpty()) {
            planesConfigurados.clear();
            planesConfigurados.addAll(nuevosPlanes);
        }
        return ResponseEntity.ok(planesConfigurados);
    }

    // --- ADMINISTRACIÓN CENTRAL DE TALLERES (CON CONTRASEÑAS Y EQUIPO VISIBLES) ---
    @GetMapping("/superadmin/talleres")
    public List listarTodosTalleres() {
        List resultado = new ArrayList();
        for (Object obj : tallerRepository.findAll()) {
            Taller t = (Taller) obj;
            Map item = new HashMap();
            item.put("id", t.getId());
            item.put("nombre", t.getNombre());
            item.put("slug", t.getSlug());
            item.put("email", t.getEmail());
            item.put("password", t.getPassword());
            item.put("ubicacion", t.getUbicacion());
            item.put("whatsapp", t.getWhatsapp());
            item.put("logoUrl", t.getLogoUrl());
            item.put("activo", t.getActivo());
            item.put("abiertoHoy", t.getAbiertoHoy());
            item.put("tieneInventario", t.getTieneInventario());
            item.put("citasHabilitadas", t.getCitasHabilitadas());
            item.put("cuposDiarios", t.getCuposDiarios());

            List equipoList = new ArrayList();
            for (Object uObj : usuarioRepository.findByTallerIdAndActivoTrue(t.getId())) {
                UsuarioTaller u = (UsuarioTaller) uObj;
                Map uMap = new HashMap();
                uMap.put("id", u.getId());
                uMap.put("nombre", u.getNombre());
                uMap.put("email", u.getEmail());
                uMap.put("password", u.getPassword());
                uMap.put("rol", u.getRol());
                uMap.put("esMecanico", u.getEsMecanico());
                equipoList.add(uMap);
            }
            item.put("equipo", equipoList);
            resultado.add(item);
        }
        return resultado;
    }

    @PostMapping("/superadmin/talleres")
    public ResponseEntity crearTallerYDueno(@RequestBody Map payload) {
        String nombreTaller = (String) payload.get("nombreTaller");
        String nombreAdmin = (String) payload.get("nombreAdmin");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String ubicacion = payload.get("ubicacion") != null ? String.valueOf(payload.get("ubicacion")) : "";
        String whatsapp = normalizarColombia(payload.get("whatsapp") != null ? String.valueOf(payload.get("whatsapp")) : "");
        boolean esMecanico = Boolean.TRUE.equals(payload.get("esMecanico"));
        boolean tieneInventario = payload.containsKey("tieneInventario")
                ? Boolean.TRUE.equals(payload.get("tieneInventario"))
                : true;

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
        taller.setTieneInventario(tieneInventario);
        taller.setCitasHabilitadas(true);
        taller.setCuposDiarios(8);
        taller.setAbiertoHoy(false);
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
    public ResponseEntity alternarEstadoTaller(@PathVariable Long id) {
        return tallerRepository.findById(id).map(t -> {
            t.setActivo(!Boolean.TRUE.equals(t.getActivo()));
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/superadmin/talleres/{id}/inventario")
    public ResponseEntity alternarInventarioTaller(@PathVariable Long id) {
        return tallerRepository.findById(id).map(t -> {
            t.setTieneInventario(!Boolean.TRUE.equals(t.getTieneInventario()));
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/talleres/{id}/password")
    public ResponseEntity actualizarPasswordTaller(@PathVariable Long id, @RequestBody Map body) {
        String nuevaPassword = body.get("password") != null ? String.valueOf(body.get("password")).trim() : "";
        if (nuevaPassword.length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña debe tener al menos 4 caracteres."));
        }
        return tallerRepository.findById(id).map(t -> {
            t.setPassword(nuevaPassword);
            tallerRepository.save(t);
            for (Object obj : usuarioRepository.findByTallerIdAndActivoTrue(id)) {
                UsuarioTaller u = (UsuarioTaller) obj;
                if ("ADMIN_TALLER".equalsIgnoreCase(u.getRol())) {
                    u.setPassword(nuevaPassword);
                    usuarioRepository.save(u);
                }
            }
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- GESTIÓN DE TRABAJADORES DENTRO DE UN TALLER ---
    @GetMapping("/talleres/{tallerId}/equipo")
    public List listarEquipo(@PathVariable Long tallerId) {
        return usuarioRepository.findByTallerIdAndActivoTrue(tallerId);
    }

    @PostMapping("/talleres/{tallerId}/equipo")
    public ResponseEntity crearTrabajador(
            @PathVariable Long tallerId,
            @RequestBody UsuarioTaller nuevo) {
        return tallerRepository.findById(tallerId).map(taller -> {
            nuevo.setTaller(taller);
            nuevo.setActivo(true);
            if (nuevo.getRol() == null || nuevo.getRol().isBlank()) {
                nuevo.setRol("MECANICO");
            }
            if (nuevo.getEsMecanico() == null) {
                nuevo.setEsMecanico(true);
            }
            return ResponseEntity.ok((Object) usuarioRepository.save(nuevo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/talleres/equipo/{usuarioId}")
    public ResponseEntity desactivarTrabajador(@PathVariable Long usuarioId) {
        return usuarioRepository.findById(usuarioId).map(u -> {
            u.setActivo(false);
            usuarioRepository.save(u);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- ENDPOINTS PÚBLICOS Y PERFIL DEL TALLER ---
    @GetMapping("/public/talleres")
    public List listarTalleresPublicos() {
        List resultado = new ArrayList();
        for (Object obj : tallerRepository.findByActivoTrue()) {
            Taller t = (Taller) obj;
            Map info = new HashMap();
            info.put("id", t.getId());
            info.put("nombre", t.getNombre());
            info.put("slug", t.getSlug());
            info.put("ubicacion", t.getUbicacion());
            info.put("whatsapp", normalizarColombia(t.getWhatsapp()));
            info.put("logoUrl", t.getLogoUrl());
            info.put("abiertoHoy", Boolean.TRUE.equals(t.getAbiertoHoy()));
            info.put("trabajandoAhora", Boolean.TRUE.equals(t.getAbiertoHoy()));
            info.put("citasHabilitadas", t.getCitasHabilitadas());
            info.put("cuposDiarios", t.getCuposDiarios());
            info.put("tecnicoNombre", obtenerTecnicoPrincipal(t.getId(), t));
            resultado.add(info);
        }
        return resultado;
    }

    @GetMapping("/public/talleres/{slug}")
    public ResponseEntity obtenerPorSlug(@PathVariable String slug) {
        Optional opt = tallerRepository.findBySlugAndActivoTrue(slug);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Taller t = (Taller) opt.get();
        Map info = new HashMap();
        info.put("id", t.getId());
        info.put("nombre", t.getNombre());
        info.put("slug", t.getSlug());
        info.put("ubicacion", t.getUbicacion());
        info.put("whatsapp", normalizarColombia(t.getWhatsapp()));
        info.put("logoUrl", t.getLogoUrl());
        info.put("abiertoHoy", Boolean.TRUE.equals(t.getAbiertoHoy()));
        info.put("trabajandoAhora", Boolean.TRUE.equals(t.getAbiertoHoy()));
        info.put("citasHabilitadas", t.getCitasHabilitadas());
        info.put("cuposDiarios", t.getCuposDiarios());
        info.put("tecnicoNombre", obtenerTecnicoPrincipal(t.getId(), t));
        return ResponseEntity.ok(info);
    }

    @PutMapping("/talleres/{id}")
    public ResponseEntity actualizarTaller(@PathVariable Long id, @RequestBody Taller datos) {
        return tallerRepository.findById(id).map(t -> {
            t.setNombre(datos.getNombre());
            t.setSlug(datos.getSlug());
            t.setUbicacion(datos.getUbicacion());
            t.setWhatsapp(normalizarColombia(datos.getWhatsapp()));
            if (datos.getLogoUrl() != null) t.setLogoUrl(datos.getLogoUrl());
            if (datos.getCitasHabilitadas() != null) t.setCitasHabilitadas(datos.getCitasHabilitadas());
            if (datos.getCuposDiarios() != null) t.setCuposDiarios(datos.getCuposDiarios());
            if (datos.getTieneInventario() != null) t.setTieneInventario(datos.getTieneInventario());
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/talleres/{id}/abrir-dia")
    public ResponseEntity abrirDiaTaller(@PathVariable Long id) {
        return tallerRepository.findById(id).map(t -> {
            t.setAbiertoHoy(true);
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/talleres/{id}/cerrar-dia")
    public ResponseEntity cerrarDiaTaller(@PathVariable Long id) {
        return tallerRepository.findById(id).map(t -> {
            t.setAbiertoHoy(false);
            return ResponseEntity.ok(tallerRepository.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/talleres/{slug}/citas")
    public List listarCitas(@PathVariable String slug) {
        List lista = (List) citasPorTaller.get(slug);
        return lista != null ? lista : new ArrayList();
    }

    @PostMapping("/public/talleres/{slug}/citas")
    public ResponseEntity crearCita(
            @PathVariable String slug,
            @RequestBody Map cita) {
        Map nuevaCita = new HashMap(cita);
        nuevaCita.put("id", UUID.randomUUID().toString());
        nuevaCita.put("telefono", normalizarColombia(cita.get("telefono") != null ? String.valueOf(cita.get("telefono")) : ""));
        if (nuevaCita.get("placa") != null) {
            nuevaCita.put("placa", String.valueOf(nuevaCita.get("placa")).toUpperCase());
        }
        List lista = (List) citasPorTaller.get(slug);
        if (lista == null) {
            lista = new ArrayList();
            citasPorTaller.put(slug, lista);
        }
        lista.add(nuevaCita);
        return ResponseEntity.ok(nuevaCita);
    }

    @GetMapping("/public/consulta")
    public ResponseEntity consultarMoto(
            @RequestParam(defaultValue = "general") String taller,
            @RequestParam String q) {

        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ingresa una placa o teléfono"));
        }

        String placaExacta = q.trim().toUpperCase().replaceAll("\\s+", "");
        String telDigitos = q.trim().replaceAll("\\D+", "");

        boolean filtrarPorTallerEspecifico = taller != null
                && !taller.isBlank()
                && !"general".equalsIgnoreCase(taller.trim());

        Taller tallerSolicitado = null;
        if (filtrarPorTallerEspecifico) {
            Optional optTaller = tallerRepository.findBySlugAndActivoTrue(taller.trim());
            if (optTaller.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            tallerSolicitado = (Taller) optTaller.get();
        }

        // Consulta optimizada en PostgreSQL (trae solo coincidencias ya ordenadas por id DESC)
        List<OrdenServicio> candidatas = ordenRepository.buscarCoincidenciasPublicas(placaExacta, telDigitos);
        List<OrdenServicio> coincidencias = new ArrayList<>();

        for (OrdenServicio o : candidatas) {
            if (o == null || o.getVehiculo() == null) {
                continue;
            }
            Taller tallerDeLaOrden = o.getTaller() != null ? o.getTaller() : o.getVehiculo().getTaller();
            if (filtrarPorTallerEspecifico) {
                if (tallerDeLaOrden == null || !tallerDeLaOrden.getId().equals(tallerSolicitado.getId())) {
                    continue;
                }
            }
            coincidencias.add(o);
        }

        if (coincidencias.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OrdenServicio actual = coincidencias.get(0);

        Taller tallerReal = actual.getTaller() != null
                ? actual.getTaller()
                : (actual.getVehiculo().getTaller() != null ? actual.getVehiculo().getTaller() : tallerSolicitado);

        List<OrdenServicio> historialMismoTaller = new ArrayList<>();
        for (OrdenServicio o : coincidencias) {
            Taller tOrd = o.getTaller() != null ? o.getTaller() : o.getVehiculo().getTaller();
            if (tallerReal == null || (tOrd != null && tOrd.getId().equals(tallerReal.getId()))) {
                historialMismoTaller.add(o);
            }
        }

        Map dto = new HashMap();
        dto.put("id", actual.getId());
        dto.put("estado", actual.getEstado() != null ? actual.getEstado().name() : "RECIBIDO");
        dto.put("motivoIngreso", actual.getMotivoIngreso());
        dto.put("diagnostico", actual.getDiagnostico());
        dto.put("trabajoRealizado", actual.getTrabajoRealizado());
        dto.put("valorTotal", actual.getValorTotal());
        dto.put("diasGarantia", actual.getDiasGarantia() != null ? actual.getDiasGarantia() : 30);
        dto.put("fechaIngreso", actual.getFechaIngreso());
        dto.put("kilometrajeIngreso", actual.getKilometrajeIngreso());
        dto.put("placa", actual.getVehiculo().getPlaca() != null ? actual.getVehiculo().getPlaca().toUpperCase() : "");
        dto.put("marca", actual.getVehiculo().getMarca());
        dto.put("modelo", actual.getVehiculo().getModelo());
        dto.put("fotoVehiculo", actual.getVehiculo().getFotoVehiculo());
        dto.put("tallerNombre", tallerReal != null ? tallerReal.getNombre() : "Taller Registrado");
        dto.put("tallerSlug", tallerReal != null ? tallerReal.getSlug() : "general");
        dto.put("tallerUbicacion", tallerReal != null ? tallerReal.getUbicacion() : "");
        dto.put("tallerWhatsapp", tallerReal != null ? normalizarColombia(tallerReal.getWhatsapp()) : "");
        dto.put("tallerLogoUrl", tallerReal != null ? tallerReal.getLogoUrl() : null);
        dto.put("trabajandoAhora", tallerReal != null && Boolean.TRUE.equals(tallerReal.getAbiertoHoy()));
        dto.put("tecnicoNombre", obtenerTecnicoPrincipal(tallerReal != null ? tallerReal.getId() : null, tallerReal));

        List historial = new ArrayList();
        for (OrdenServicio o : historialMismoTaller) {
            Map item = new HashMap();
            item.put("id", o.getId());
            item.put("fechaIngreso", o.getFechaIngreso());
            item.put("kilometrajeIngreso", o.getKilometrajeIngreso());
            item.put("motivoIngreso", o.getMotivoIngreso());
            item.put("diagnostico", o.getDiagnostico());
            item.put("trabajoRealizado", o.getTrabajoRealizado());
            item.put("valorTotal", o.getValorTotal());
            item.put("diasGarantia", o.getDiasGarantia() != null ? o.getDiasGarantia() : 30);
            item.put("estado", o.getEstado() != null ? o.getEstado().name() : "RECIBIDO");
            historial.add(item);
        }

        dto.put("historial", historial);
        return ResponseEntity.ok(dto);
    }
}
package integrador.backend.controller;

import integrador.backend.dto.TransaccionRequest;
import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.service.CajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    @GetMapping("/hoy")
    public ResponseEntity<List<Transaccion>> listarHoy() {
        return ResponseEntity.ok(cajaService.listarHoy());
    }

    @GetMapping("/reporte")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reporte> reporteHoy() {
        return ResponseEntity.ok(cajaService.obtenerReporteHoy());
    }

    @PostMapping
    public ResponseEntity<Transaccion> registrar(@RequestBody TransaccionRequest request) {
        return ResponseEntity.ok(cajaService.registrar(request));
    }
}

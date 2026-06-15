package integrador.backend.controller;

import integrador.backend.entity.Turno;
import integrador.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class ColaController {

    @Autowired
    private TurnoService turnoService;

    @PostMapping
    public ResponseEntity<Turno> generarTurno(
            @RequestParam String cliente,
            @RequestParam Long idServicio,
            @RequestParam(required = false) Long idBarbero) {
        return ResponseEntity.ok(turnoService.crearTurno(cliente, idServicio, idBarbero));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Turno> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        return ResponseEntity.ok(turnoService.cambiarEstado(id, estado));
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<Turno> asignarBarbero(
            @PathVariable Long id,
            @RequestParam Long idBarbero) {
        return ResponseEntity.ok(turnoService.asignarBarbero(id, idBarbero));
    }

    @GetMapping
    public ResponseEntity<List<Turno>> verCola() {
        return ResponseEntity.ok(turnoService.listarTurnosDeHoy());
    }
}
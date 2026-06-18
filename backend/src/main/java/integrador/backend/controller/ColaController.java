package integrador.backend.controller;

import integrador.backend.entity.Turno;
import integrador.backend.service.EventoBroadcaster;
import integrador.backend.service.TurnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class ColaController {

    @Autowired private TurnoService turnoService;
    @Autowired private EventoBroadcaster broadcaster;

    @PostMapping
    public ResponseEntity<Turno> generarTurno(
            @RequestParam String cliente,
            @RequestParam Long idServicio,
            @RequestParam(required = false) Long idBarbero) {
        Turno t = turnoService.crearTurno(cliente, idServicio, idBarbero);
        broadcaster.broadcast();
        return ResponseEntity.ok(t);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Turno> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        Turno t = turnoService.cambiarEstado(id, estado);
        broadcaster.broadcast();
        return ResponseEntity.ok(t);
    }

    @PutMapping("/{id}/asignar")
    public ResponseEntity<Turno> asignarBarbero(
            @PathVariable Long id,
            @RequestParam Long idBarbero) {
        Turno t = turnoService.asignarBarbero(id, idBarbero);
        broadcaster.broadcast();
        return ResponseEntity.ok(t);
    }

    @GetMapping
    public ResponseEntity<List<Turno>> verCola() {
        return ResponseEntity.ok(turnoService.listarTurnosDeHoy());
    }
}
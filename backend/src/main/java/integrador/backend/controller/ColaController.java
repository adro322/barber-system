package integrador.backend.controller;

import integrador.backend.dto.TurnoRequest;
import integrador.backend.entity.Turno;
import integrador.backend.service.ColaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cola")
@RequiredArgsConstructor
public class ColaController {

    private final ColaService colaService;

    @GetMapping
    public ResponseEntity<List<Turno>> listar() {
        return ResponseEntity.ok(colaService.listarCola());
    }

    @GetMapping("/barbero/{barberoId}")
    public ResponseEntity<List<Turno>> listarPorBarbero(@PathVariable Long barberoId) {
        return ResponseEntity.ok(colaService.listarColaPorBarbero(barberoId));
    }

    @PostMapping
    public ResponseEntity<Turno> registrar(@RequestBody TurnoRequest request) {
        return ResponseEntity.ok(colaService.registrar(request));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Turno> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(colaService.finalizar(id));
    }
}

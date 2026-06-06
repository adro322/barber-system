package integrador.backend.controller;

import integrador.backend.dto.BarberoRequest;
import integrador.backend.entity.Barbero;
import integrador.backend.service.BarberoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barberos")
@RequiredArgsConstructor
public class BarberoController {

    private final BarberoService barberoService;

    @GetMapping
    public ResponseEntity<List<Barbero>> listar() {
        return ResponseEntity.ok(barberoService.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Barbero>> listarActivos() {
        return ResponseEntity.ok(barberoService.listarActivos());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Barbero> crear(@RequestBody BarberoRequest request) {
        return ResponseEntity.ok(barberoService.crear(request));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Barbero> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(barberoService.cambiarEstado(id));
    }
}

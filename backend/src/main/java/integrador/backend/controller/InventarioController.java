package integrador.backend.controller;

import integrador.backend.dto.InsumoRequest;
import integrador.backend.entity.Insumo;
import integrador.backend.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<List<Insumo>> listar() {
        return ResponseEntity.ok(inventarioService.listarTodos());
    }

    @GetMapping("/criticos")
    public ResponseEntity<List<Insumo>> criticos() {
        return ResponseEntity.ok(inventarioService.listarCriticos());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Insumo> crear(@RequestBody InsumoRequest request) {
        return ResponseEntity.ok(inventarioService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Insumo> actualizar(@PathVariable Long id, @RequestBody InsumoRequest request) {
        return ResponseEntity.ok(inventarioService.actualizar(id, request));
    }
}

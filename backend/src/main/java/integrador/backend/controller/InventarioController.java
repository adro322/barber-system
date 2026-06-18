package integrador.backend.controller;

import integrador.backend.entity.Insumo;
import integrador.backend.service.EventoBroadcaster;
import integrador.backend.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InventarioController {

    @Autowired private InsumoService insumoService;
    @Autowired private EventoBroadcaster broadcaster;

    @PostMapping
    public ResponseEntity<Insumo> crearInsumo(@RequestBody Insumo insumo) {
        Insumo saved = insumoService.guardarInsumo(insumo);
        broadcaster.broadcast();
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Insumo>> obtenerInsumos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Insumo> actualizarInsumo(@PathVariable Long id, @RequestBody Insumo insumo) {
        Insumo updated = insumoService.actualizarInsumo(id, insumo);
        broadcaster.broadcast();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarInsumo(@PathVariable Long id) {
        insumoService.eliminarInsumo(id);
        broadcaster.broadcast();
        return ResponseEntity.ok("Insumo eliminado exitosamente");
    }

    @PatchMapping("/{id}/agotar")
    public ResponseEntity<Insumo> agotar(@PathVariable Long id) {
        Insumo updated = insumoService.descontarStock(id);
        broadcaster.broadcast();
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<Insumo>> verAlertasStock() {
        return ResponseEntity.ok(insumoService.obtenerInsumosEnAlerta());
    }
}

package integrador.backend.controller;

import integrador.backend.entity.Insumo;
import integrador.backend.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InventarioController {

    @Autowired
    private InsumoService insumoService;

    @PostMapping
    public ResponseEntity<Insumo> crearInsumo(@RequestBody Insumo insumo) {
        return ResponseEntity.ok(insumoService.guardarInsumo(insumo));
    }

    @GetMapping
    public ResponseEntity<List<Insumo>> obtenerInsumos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Insumo> actualizarInsumo(@PathVariable Long id, @RequestBody Insumo insumo) {
        return ResponseEntity.ok(insumoService.actualizarInsumo(id, insumo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarInsumo(@PathVariable Long id) {
        insumoService.eliminarInsumo(id);
        return ResponseEntity.ok("Insumo eliminado exitosamente");
    }

    @PatchMapping("/{id}/agotar")
    public ResponseEntity<Insumo> agotar(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.descontarStock(id));
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<Insumo>> verAlertasStock() {
        return ResponseEntity.ok(insumoService.obtenerInsumosEnAlerta());
    }
}

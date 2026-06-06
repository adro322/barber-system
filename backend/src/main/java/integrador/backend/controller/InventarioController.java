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
}
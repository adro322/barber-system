package integrador.backend.controller;

import integrador.backend.entity.Servicio;
import integrador.backend.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @PostMapping
    public ResponseEntity<Servicio> registrarServicio(@RequestBody Servicio servicio) {
        return ResponseEntity.ok(servicioService.crearServicio(servicio));
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> obtenerServicios() {
        return ResponseEntity.ok(servicioService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> actualizarServicio(
            @PathVariable Long id,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) BigDecimal precio,
            @RequestParam(required = false) String descripcion) {
        return ResponseEntity.ok(servicioService.actualizarServicio(id, nombre, precio, descripcion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarServicio(@PathVariable Long id) {
        servicioService.eliminarServicio(id);
        return ResponseEntity.ok("Servicio eliminado exitosamente");
    }
}

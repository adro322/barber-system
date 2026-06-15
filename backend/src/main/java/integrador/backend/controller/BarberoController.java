package integrador.backend.controller;

import integrador.backend.entity.Barbero;
import integrador.backend.service.BarberoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/barberos")
public class BarberoController {

    @Autowired
    private BarberoService barberoService;

    @PostMapping("/perfil")
    public ResponseEntity<Barbero> registrarBarbero(
            @RequestParam Long idUsuario,
            @RequestParam String telefono) {
        return ResponseEntity.ok(barberoService.crearPerfilBarbero(idUsuario, telefono));
    }

    @GetMapping
    public ResponseEntity<List<Barbero>> listarBarberos() {
        return ResponseEntity.ok(barberoService.obtenerTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barbero> actualizarBarbero(
            @PathVariable Long id,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String telefono) {
        return ResponseEntity.ok(barberoService.actualizarBarbero(id, nombre, telefono));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Barbero> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        return ResponseEntity.ok(barberoService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarBarbero(@PathVariable Long id) {
        barberoService.eliminarBarbero(id);
        return ResponseEntity.ok("Barbero eliminado exitosamente");
    }
}

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
        
        Barbero nuevoBarbero = barberoService.crearPerfilBarbero(idUsuario, telefono);
        return ResponseEntity.ok(nuevoBarbero);
    }

    @GetMapping
    public ResponseEntity<List<Barbero>> listarBarberos() {
        return ResponseEntity.ok(barberoService.obtenerTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarBarbero(@PathVariable Long id) {
        barberoService.eliminarBarbero(id);
        return ResponseEntity.ok("Barbero eliminado exitosamente");
    }
}
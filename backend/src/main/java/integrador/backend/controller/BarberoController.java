package integrador.backend.controller;

import integrador.backend.entity.Barbero;
import integrador.backend.service.BarberoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
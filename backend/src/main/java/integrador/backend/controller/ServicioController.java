package integrador.backend.controller;

import integrador.backend.entity.Servicio;
import integrador.backend.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @PostMapping
    public ResponseEntity<Servicio> registrarServicio(
            @RequestBody Servicio servicio, 
            @RequestParam Long idBarbero) {
        return ResponseEntity.ok(servicioService.crearServicio(servicio, idBarbero));
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> obtenerServicios() {
        return ResponseEntity.ok(servicioService.listarTodos());
    }
}
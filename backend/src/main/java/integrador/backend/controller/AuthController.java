package integrador.backend.controller;

import integrador.backend.entity.Usuario;
import integrador.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") 
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrarUsuario(
            @RequestBody Usuario nuevoUsuario, 
            @RequestParam String rol) {
        
        // El Controlador le pasa los datos al Service
        Usuario usuarioCreado = usuarioService.registrarUsuario(nuevoUsuario, rol.toUpperCase());
        
        // Devuelve el plato listo al cliente (Status 200 OK)
        return ResponseEntity.ok(usuarioCreado);
    }
}
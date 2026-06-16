package integrador.backend.controller;

import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PutMapping("/{id}/contrasena")
    public ResponseEntity<String> resetContrasena(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        String nueva = body.get("nuevaContrasena");
        if (nueva == null || nueva.isBlank()) {
            return ResponseEntity.badRequest().body("La nueva contraseña no puede estar vacía");
        }
        usuario.setContrasena(passwordEncoder.encode(nueva));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Contraseña actualizada");
    }
}

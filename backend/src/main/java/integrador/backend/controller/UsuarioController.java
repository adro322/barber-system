package integrador.backend.controller;

import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/{id}/contrasena")
    public ResponseEntity<String> cambiarContrasena(
            @PathVariable Long id,
            @RequestParam String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Contraseña actualizada exitosamente.");
    }
}

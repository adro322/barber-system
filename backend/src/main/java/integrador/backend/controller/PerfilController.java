package integrador.backend.controller;

import integrador.backend.dto.CambiarEmailRequest;
import integrador.backend.dto.CambiarPasswordRequest;
import integrador.backend.dto.LoginResponse;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private BarberoRepository barberoRepository;

    private Usuario getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PatchMapping("/activar")
    public ResponseEntity<String> activarCuenta() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Barbero barbero = barberoRepository.findByUsuarioEmail(email)
                .orElse(null);
        if (barbero == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Perfil de barbero no encontrado");
        barbero.setEstado("ACTIVO");
        barberoRepository.save(barbero);
        return ResponseEntity.ok("Cuenta activada");
    }

    @PutMapping("/email")
    public ResponseEntity<?> cambiarEmail(@Valid @RequestBody CambiarEmailRequest req) {
        Usuario usuario = getUsuarioActual();

        if (!passwordEncoder.matches(req.getContrasenaActual(), usuario.getContrasena()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");

        if (usuarioRepository.findByEmail(req.getNuevoEmail()).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El correo ya está en uso");

        usuario.setEmail(req.getNuevoEmail());
        usuarioRepository.save(usuario);

        String nuevoToken = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(nuevoToken, usuario.getRol().getNombre(), usuario.getNombre(), usuario.getEmail()));
    }

    @PutMapping("/password")
    public ResponseEntity<String> cambiarPassword(@Valid @RequestBody CambiarPasswordRequest req) {
        Usuario usuario = getUsuarioActual();

        if (!passwordEncoder.matches(req.getContrasenaActual(), usuario.getContrasena()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña actual incorrecta");

        usuario.setContrasena(passwordEncoder.encode(req.getNuevaContrasena()));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }
}

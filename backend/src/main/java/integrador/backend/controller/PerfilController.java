package integrador.backend.controller;

import integrador.backend.dto.CambiarEmailRequest;
import integrador.backend.dto.CambiarPasswordRequest;
import jakarta.validation.Valid;
import integrador.backend.dto.LoginResponse;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.security.JwtService;
import integrador.backend.service.EmailService;
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
    @Autowired private EmailService emailService;

    private Usuario getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping("/solicitar-activacion")
    public ResponseEntity<String> solicitarActivacion() {
        Usuario usuario = getUsuarioActual();
        emailService.enviarSolicitudActivacion(usuario.getNombre(), usuario.getEmail());
        return ResponseEntity.ok("Solicitud enviada al administrador");
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

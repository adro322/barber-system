package integrador.backend.controller;

import integrador.backend.dto.ResetPasswordRequest;
import integrador.backend.entity.Usuario;
import integrador.backend.service.EmailService;
import integrador.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import integrador.backend.dto.LoginRequest;
import integrador.backend.dto.LoginResponse;
import integrador.backend.security.JwtService;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(
            @RequestBody Usuario nuevoUsuario,
            @RequestParam String rol) {

        String rolUpper = rol.toUpperCase();
        if ("ADMIN".equals(rolUpper)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No se puede registrar un usuario con rol ADMIN desde este endpoint.");
        }

        Usuario usuarioCreado = usuarioService.registrarUsuario(nuevoUsuario, rolUpper);
        return ResponseEntity.ok(usuarioCreado);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> iniciarSesion(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getContrasena())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(token, usuario.getRol().getNombre(), usuario.getNombre(), usuario.getEmail()));
    }

    @PostMapping("/enviar-codigo-recuperacion")
    public ResponseEntity<String> enviarCodigo(@RequestParam String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("El correo no está registrado"));

        String codigo = String.format("%06d", (int)(Math.random() * 1000000));

        usuario.setCodigoRecuperacion(codigo);
        usuario.setCodigoExpiracion(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        emailService.enviarCodigoRecuperacion(usuario.getEmail(), codigo);

        return ResponseEntity.ok("Código enviado al correo. Válido por 15 minutos.");
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<String> restablecerPassword(@RequestBody ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getCodigoRecuperacion() == null
                || !usuario.getCodigoRecuperacion().equals(request.getCodigo())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El código de seguridad es incorrecto.");
        }

        if (usuario.getCodigoExpiracion() == null
                || LocalDateTime.now().isAfter(usuario.getCodigoExpiracion())) {
            usuario.setCodigoRecuperacion(null);
            usuario.setCodigoExpiracion(null);
            usuarioRepository.save(usuario);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El código ha expirado. Solicita uno nuevo.");
        }

        usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        usuario.setCodigoRecuperacion(null);
        usuario.setCodigoExpiracion(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.");
    }
}

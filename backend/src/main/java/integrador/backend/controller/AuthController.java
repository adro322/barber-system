package integrador.backend.controller;

import integrador.backend.dto.LoginRequest;
import integrador.backend.dto.LoginResponse;
import integrador.backend.dto.ResetPasswordRequest;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.security.JwtService;
import integrador.backend.service.EmailService;
import integrador.backend.service.RateLimiterService;
import integrador.backend.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RateLimiterService rateLimiter;

    private String clientIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        return (forwarded != null) ? forwarded.split(",")[0].trim() : req.getRemoteAddr();
    }

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
    public ResponseEntity<?> iniciarSesion(@RequestBody LoginRequest request, HttpServletRequest httpReq) {
        String ip = clientIp(httpReq);
        String rateKey = "login:" + request.getEmail().toLowerCase() + ":" + ip;

        // Máximo 10 intentos por email+IP cada 15 minutos
        if (!rateLimiter.tryConsume(rateKey, 10, 15 * 60 * 1000L)) {
            log.warn("Rate limit login alcanzado — email={} ip={}", request.getEmail(), ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getContrasena())
            );
        } catch (BadCredentialsException e) {
            log.warn("Intento de login fallido — email={} ip={}", request.getEmail(), ip);
            // Mensaje genérico: no revelamos si el email existe o no
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales incorrectas. Verifica tu correo y contraseña.");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        log.info("Login exitoso — email={} ip={}", request.getEmail(), ip);
        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponse(token, usuario.getRol().getNombre(), usuario.getNombre(), usuario.getEmail()));
    }

    @PostMapping("/enviar-codigo-recuperacion")
    public ResponseEntity<String> enviarCodigo(@RequestParam String email, HttpServletRequest httpReq) {
        String ip = clientIp(httpReq);
        String rateKey = "codigo:" + email.toLowerCase();

        // Máximo 3 envíos por email por hora (previene email bombing)
        if (!rateLimiter.tryConsume(rateKey, 3, 60 * 60 * 1000L)) {
            log.warn("Rate limit código alcanzado — email={} ip={}", email, ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Has solicitado demasiados códigos. Espera una hora antes de volver a intentarlo.");
        }

        // Respuesta genérica: no revelamos si el email existe o no
        Optional<Usuario> opt = usuarioRepository.findByEmail(email);
        if (opt.isPresent()) {
            Usuario usuario = opt.get();
            String codigo = String.format("%06d", new SecureRandom().nextInt(1000000));
            usuario.setCodigoRecuperacion(codigo);
            usuario.setCodigoExpiracion(LocalDateTime.now().plusMinutes(15));
            usuarioRepository.save(usuario);
            emailService.enviarCodigoRecuperacion(email, codigo);
            log.info("Código de recuperación enviado — email={}", email);
        } else {
            log.warn("Código de recuperación solicitado para email no registrado — email={} ip={}", email, ip);
        }

        // Siempre la misma respuesta para no revelar si el correo existe
        return ResponseEntity.ok("Si el correo está registrado, recibirás un código en breve.");
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<String> restablecerPassword(@RequestBody ResetPasswordRequest request, HttpServletRequest httpReq) {
        String ip = clientIp(httpReq);
        String rateKey = "reset:" + request.getEmail().toLowerCase();

        // Máximo 5 intentos de código por email cada 15 minutos (previene brute force)
        if (!rateLimiter.tryConsume(rateKey, 5, 15 * 60 * 1000L)) {
            log.warn("Rate limit reset alcanzado — email={} ip={}", request.getEmail(), ip);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Demasiados intentos. Solicita un nuevo código.");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getCodigoRecuperacion() == null
                || !usuario.getCodigoRecuperacion().equals(request.getCodigo())) {
            log.warn("Código de recuperación incorrecto — email={} ip={}", request.getEmail(), ip);
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

        log.info("Contraseña restablecida — email={}", request.getEmail());
        return ResponseEntity.ok("¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.");
    }
}

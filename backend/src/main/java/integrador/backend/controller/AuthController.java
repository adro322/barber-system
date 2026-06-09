package integrador.backend.controller;

import integrador.backend.entity.Usuario;
import integrador.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import integrador.backend.dto.LoginRequest;
import integrador.backend.dto.LoginResponse;
import integrador.backend.security.JwtService;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@RestController
@RequestMapping("/api/auth") 
public class AuthController {

    @Autowired private UsuarioService usuarioService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtService jwtService;
    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrarUsuario(
            @RequestBody Usuario nuevoUsuario, 
            @RequestParam String rol) {
        
        // El Controlador le pasa los datos al Service
        Usuario usuarioCreado = usuarioService.registrarUsuario(nuevoUsuario, rol.toUpperCase());
        
        // Devuelve listo al cliente 
        return ResponseEntity.ok(usuarioCreado);
    }
   
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> iniciarSesion(@RequestBody LoginRequest request) {
        // 1. Verificamos que la contraseña sea correcta
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getContrasena())
        );

        // 2. Buscamos al usuario para sacar sus datos
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Generamos el Token
        String token = jwtService.generarToken(usuario);

        // 4. Devolvemos el pase VIP a React
        return ResponseEntity.ok(new LoginResponse(token, usuario.getRol().getNombre()));
    }

    @PostMapping("/enviar-codigo-recuperacion")
    public ResponseEntity<String> enviarCodigo(@RequestParam String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("El correo no está registrado"));

        // 1. Generamos un código de 6 dígitos aleatorio
        String codigo = String.format("%06d", (int)(Math.random() * 1000000));

        // 2. Lo guardamos en la base de datos para validarlo después
        usuario.setCodigoRecuperacion(codigo);
        usuarioRepository.save(usuario);

        // 3. ¡Usamos nuestro nuevo EmailService con Apache Commons!
        emailService.enviarCodigoRecuperacion(usuario.getEmail(), codigo);

        return ResponseEntity.ok("Código enviado al correo.");
    }
    

    @PostMapping("/restablecer-password")
    public ResponseEntity<String> restablecerPassword(@RequestBody ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Verificamos que el código coincida
        if (usuario.getCodigoRecuperacion() == null || !usuario.getCodigoRecuperacion().equals(request.getCodigo())) {
            throw new RuntimeException("El código de seguridad es incorrecto o ha expirado.");
        }

        // 2. Encriptamos la NUEVA contraseña que el usuario eligió 
        usuario.setContrasena(passwordEncoder.encode(request.getNuevaContrasena()));
        
        // 3. Borramos el código para que no se pueda volver a usar
        usuario.setCodigoRecuperacion(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.");
    }
}
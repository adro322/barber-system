package integrador.backend.service;

import integrador.backend.dto.LoginRequest;
import integrador.backend.dto.LoginResponse;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Credenciales incorrectas");
        }
        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new LoginResponse(token, usuario.getNombre(), usuario.getRol().name());
    }
}

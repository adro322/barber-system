package integrador.backend.service;

import integrador.backend.dto.BarberoRequest;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.enums.EstadoBarbero;
import integrador.backend.enums.Rol;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BarberoService {

    private final BarberoRepository barberoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Barbero> listarTodos() {
        return barberoRepository.findAll();
    }

    public List<Barbero> listarActivos() {
        return barberoRepository.findByEstado(EstadoBarbero.ACTIVO);
    }

    @Transactional
    public Barbero crear(BarberoRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .rol(Rol.BARBERO)
                .activo(true)
                .build();
        usuarioRepository.save(usuario);

        Barbero barbero = Barbero.builder()
                .usuario(usuario)
                .nombre(request.getNombre())
                .telefono(request.getTelefono())
                .estado(EstadoBarbero.ACTIVO)
                .build();
        return barberoRepository.save(barbero);
    }

    @Transactional
    public Barbero cambiarEstado(Long id) {
        Barbero barbero = barberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        barbero.setEstado(
                barbero.getEstado() == EstadoBarbero.ACTIVO ? EstadoBarbero.INACTIVO : EstadoBarbero.ACTIVO
        );
        return barberoRepository.save(barbero);
    }
}

package integrador.backend.service;

import integrador.backend.entity.Rol;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.RolRepository;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario, String nombreRol) {
        Optional<Rol> rolExistente = rolRepository.findByNombre(nombreRol);

        Rol rol;
        if (rolExistente.isPresent()) {
            rol = rolExistente.get();
        } else {
            Rol nuevoRol = new Rol();
            nuevoRol.setNombre(nombreRol);
            rol = rolRepository.save(nuevoRol);
        }

        usuario.setRol(rol);
        String pwd = (usuario.getContrasena() == null || usuario.getContrasena().isBlank())
                ? "Barber1234"
                : usuario.getContrasena();
        usuario.setContrasena(passwordEncoder.encode(pwd));
        return usuarioRepository.save(usuario);
    }
}

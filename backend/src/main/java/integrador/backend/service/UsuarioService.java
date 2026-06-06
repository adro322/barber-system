package integrador.backend.service;

import integrador.backend.entity.Rol;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.RolRepository;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    // Herramienta para encriptar la contraseña (¡Ciberseguridad!)
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Usuario registrarUsuario(Usuario usuario, String nombreRol) {
        // 1. Buscamos si el rol existe en la base de datos
        Optional<Rol> rolExistente = rolRepository.findByNombre(nombreRol);
        
        Rol rol;
        if (rolExistente.isPresent()) {
            rol = rolExistente.get();
        } else {
            // Si el rol no existe (ej. la base de datos está vacía), lo creamos
            Rol nuevoRol = new Rol();
            nuevoRol.setNombre(nombreRol);
            rol = rolRepository.save(nuevoRol);
        }

        // 2. Le asignamos el rol al usuario
        usuario.setRol(rol);

        // 3. Encriptamos la contraseña para no guardarla en texto plano
        String contrasenaEncriptada = passwordEncoder.encode(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);

        // 4. Guardamos el usuario final en la base de datos
        return usuarioRepository.save(usuario);
    }
}
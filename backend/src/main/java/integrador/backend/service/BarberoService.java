package integrador.backend.service;

import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BarberoService {

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Barbero crearPerfilBarbero(Long idUsuario, String telefono) {
        // 1. Buscamos al usuario en la base de datos
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Creamos el perfil del barbero y lo enlazamos
        Barbero barbero = new Barbero();
        barbero.setUsuario(usuario);
        barbero.setNombre(usuario.getNombre()); // Heredamos el nombre del usuario
        barbero.setTelefono(telefono);
        barbero.setEstado("ACTIVO");

        // 3. Lo guardamos en la tabla barberos
        return barberoRepository.save(barbero);
    }
}
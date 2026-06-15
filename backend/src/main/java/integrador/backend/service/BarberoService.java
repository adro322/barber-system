package integrador.backend.service;

import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BarberoService {

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Barbero crearPerfilBarbero(Long idUsuario, String telefono) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Barbero barbero = new Barbero();
        barbero.setUsuario(usuario);
        barbero.setNombre(usuario.getNombre());
        barbero.setTelefono(telefono);
        barbero.setEstado("ACTIVO");

        return barberoRepository.save(barbero);
    }

    public List<Barbero> obtenerTodos() {
        return barberoRepository.findAll();
    }

    public Barbero actualizarBarbero(Long id, String nombre, String telefono) {
        Barbero barbero = barberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        if (nombre != null) barbero.setNombre(nombre);
        if (telefono != null) barbero.setTelefono(telefono);
        return barberoRepository.save(barbero);
    }

    public Barbero cambiarEstado(Long id, String estado) {
        Barbero barbero = barberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        barbero.setEstado(estado.toUpperCase());
        return barberoRepository.save(barbero);
    }

    public void eliminarBarbero(Long id) {
        Barbero barbero = barberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        barberoRepository.delete(barbero);
    }
}

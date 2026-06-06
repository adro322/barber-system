package integrador.backend.service;

import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

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
        barbero.setNombre(usuario.getNombre()); 
        barbero.setTelefono(telefono);
        barbero.setEstado("ACTIVO");

        // 3. Lo guardamos en la tabla barberos
        return barberoRepository.save(barbero);
    }
    
    public List<Barbero> obtenerTodos() {
        return barberoRepository.findAll();
    }

    public void eliminarBarbero(Long id) {
        Barbero barbero = barberoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        barberoRepository.delete(barbero);
    }
}
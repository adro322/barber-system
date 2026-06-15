package integrador.backend.service;

import integrador.backend.entity.Servicio;
import integrador.backend.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    public Servicio crearServicio(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }

    public Servicio actualizarServicio(Long id, String nombre, BigDecimal precio, String descripcion) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        if (nombre != null) servicio.setNombre(nombre);
        if (precio != null) servicio.setPrecio(precio);
        if (descripcion != null) servicio.setDescripcion(descripcion);
        return servicioRepository.save(servicio);
    }

    public void eliminarServicio(Long id) {
        servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        servicioRepository.deleteById(id);
    }
}

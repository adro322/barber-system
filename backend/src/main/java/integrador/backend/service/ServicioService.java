package integrador.backend.service;

import integrador.backend.entity.Servicio;
import integrador.backend.entity.Barbero;
import integrador.backend.repository.ServicioRepository;
import integrador.backend.repository.BarberoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private BarberoRepository barberoRepository;

    public Servicio crearServicio(Servicio servicio, Long idBarbero) {
        Barbero barbero = barberoRepository.findById(idBarbero)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        servicio.setBarbero(barbero);
        return servicioRepository.save(servicio);
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }
}
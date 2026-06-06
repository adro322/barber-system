package integrador.backend.service;

import integrador.backend.entity.Turno;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.Servicio;
import integrador.backend.repository.TurnoRepository;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public Turno crearTurno(String nombreCliente, Long idBarbero, Long idServicio) {
        Barbero barbero = barberoRepository.findById(idBarbero)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
                
        Servicio servicio = servicioRepository.findById(idServicio)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        Turno turno = new Turno();
        turno.setNombreCliente(nombreCliente);
        turno.setBarbero(barbero);
        turno.setServicio(servicio);
        turno.setEstado("ESPERA"); 

        return turnoRepository.save(turno);
    }

    public Turno cambiarEstado(Long idTurno, String nuevoEstado) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        
        // Los estados válidos serán: ESPERA, ATENDIENDO, FINALIZADO, CANCELADO
        turno.setEstado(nuevoEstado.toUpperCase());
        return turnoRepository.save(turno);
    }

    public List<Turno> listarTurnosDeHoy() {
        return turnoRepository.findAll();
    }
}
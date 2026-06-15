package integrador.backend.service;

import integrador.backend.entity.Turno;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.Servicio;
import integrador.backend.repository.TurnoRepository;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public Turno crearTurno(String nombreCliente, Long idServicio, Long idBarbero) {
        Servicio servicio = servicioRepository.findById(idServicio)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        Turno turno = new Turno();
        turno.setNombreCliente(nombreCliente);
        turno.setServicio(servicio);
        turno.setEstado("ESPERA");

        if (idBarbero != null) {
            Barbero barbero = barberoRepository.findById(idBarbero)
                    .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
            turno.setBarbero(barbero);
        }

        return turnoRepository.save(turno);
    }

    public Turno asignarBarbero(Long idTurno, Long idBarbero) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        Barbero barbero = barberoRepository.findById(idBarbero)
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        turno.setBarbero(barbero);
        turno.setEstado("ATENDIENDO");
        return turnoRepository.save(turno);
    }

    public Turno cambiarEstado(Long idTurno, String nuevoEstado) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));
        turno.setEstado(nuevoEstado.toUpperCase());
        return turnoRepository.save(turno);
    }

    public List<Turno> listarTurnosDeHoy() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        return turnoRepository.findByFechaHoraBetween(inicioDia, finDia);
    }
}

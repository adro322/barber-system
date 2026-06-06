package integrador.backend.service;

import integrador.backend.dto.TurnoRequest;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.DetalleServicio;
import integrador.backend.entity.Servicio;
import integrador.backend.entity.Turno;
import integrador.backend.enums.EstadoTurno;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.DetalleServicioRepository;
import integrador.backend.repository.InsumoRepository;
import integrador.backend.repository.ServicioRepository;
import integrador.backend.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColaService {

    private final TurnoRepository turnoRepository;
    private final BarberoRepository barberoRepository;
    private final ServicioRepository servicioRepository;
    private final DetalleServicioRepository detalleServicioRepository;
    private final InsumoRepository insumoRepository;

    public List<Turno> listarCola() {
        return turnoRepository.findByEstadoIn(
                List.of(EstadoTurno.ESPERA, EstadoTurno.EN_ATENCION)
        );
    }

    public List<Turno> listarColaPorBarbero(Long barberoId) {
        return turnoRepository.findByBarberoIdAndEstadoIn(
                barberoId, List.of(EstadoTurno.ESPERA, EstadoTurno.EN_ATENCION)
        );
    }

    @Transactional
    public Turno registrar(TurnoRequest request) {
        Barbero barbero = barberoRepository.findById(request.getBarberoId())
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        Servicio servicio = servicioRepository.findById(request.getServicioId())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        Turno turno = Turno.builder()
                .barbero(barbero)
                .servicio(servicio)
                .nombreCliente(request.getNombreCliente())
                .estado(EstadoTurno.ESPERA)
                .build();
        return turnoRepository.save(turno);
    }

    @Transactional
    public Turno finalizar(Long turnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        // Descuento automático de insumos al finalizar
        List<DetalleServicio> detalles = detalleServicioRepository.findByServicioId(turno.getServicio().getId());
        for (DetalleServicio detalle : detalles) {
            var insumo = detalle.getInsumo();
            int nuevoStock = Math.max(0, insumo.getStock() - detalle.getCantidadUsada());
            insumo.setStock(nuevoStock);
            insumoRepository.save(insumo);
        }

        turno.setEstado(EstadoTurno.FINALIZADO);
        return turnoRepository.save(turno);
    }
}

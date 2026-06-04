package integrador.backend.service;

import integrador.backend.dto.TransaccionRequest;
import integrador.backend.entity.Barbero;
import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.entity.Turno;
import integrador.backend.enums.TipoPago;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.ReporteRepository;
import integrador.backend.repository.TransaccionRepository;
import integrador.backend.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CajaService {

    private final TransaccionRepository transaccionRepository;
    private final BarberoRepository barberoRepository;
    private final TurnoRepository turnoRepository;
    private final ReporteRepository reporteRepository;

    public List<Transaccion> listarHoy() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fin    = LocalDate.now().atTime(LocalTime.MAX);
        return transaccionRepository.findByFechaBetween(inicio, fin);
    }

    @Transactional
    public Transaccion registrar(TransaccionRequest request) {
        Barbero barbero = barberoRepository.findById(request.getBarberoId())
                .orElseThrow(() -> new RuntimeException("Barbero no encontrado"));
        Turno turno = turnoRepository.findById(request.getTurnoId())
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        Transaccion transaccion = Transaccion.builder()
                .barbero(barbero)
                .turno(turno)
                .monto(request.getMonto())
                .tipoPago(request.getTipoPago())
                .build();
        Transaccion guardada = transaccionRepository.save(transaccion);

        actualizarReporteDiario(request.getMonto(), request.getTipoPago());
        return guardada;
    }

    public Reporte obtenerReporteHoy() {
        return reporteRepository.findByFecha(LocalDate.now())
                .orElse(Reporte.builder().fecha(LocalDate.now()).build());
    }

    private void actualizarReporteDiario(BigDecimal monto, TipoPago tipo) {
        Reporte reporte = reporteRepository.findByFecha(LocalDate.now())
                .orElse(Reporte.builder().fecha(LocalDate.now()).build());

        switch (tipo) {
            case EFECTIVO -> reporte.setTotalEfectivo(reporte.getTotalEfectivo().add(monto));
            case YAPE     -> reporte.setTotalYape(reporte.getTotalYape().add(monto));
            case PLIN     -> reporte.setTotalPlin(reporte.getTotalPlin().add(monto));
        }
        reporte.setTotalGeneral(
                reporte.getTotalEfectivo()
                        .add(reporte.getTotalYape())
                        .add(reporte.getTotalPlin())
        );
        reporteRepository.save(reporte);
    }
}

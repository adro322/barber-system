package integrador.backend.scheduler;

import integrador.backend.repository.ReporteRepository;
import integrador.backend.repository.TransaccionRepository;
import integrador.backend.service.ReporteService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class CierreAutomaticoScheduler {

    private final ReporteRepository reporteRepository;
    private final TransaccionRepository transaccionRepository;
    private final ReporteService reporteService;

    public CierreAutomaticoScheduler(ReporteRepository reporteRepository,
                                     TransaccionRepository transaccionRepository,
                                     ReporteService reporteService) {
        this.reporteRepository = reporteRepository;
        this.transaccionRepository = transaccionRepository;
        this.reporteService = reporteService;
    }

    @Scheduled(cron = "0 0 22 * * *", zone = "America/Lima")
    public void cerrarCajaAutomaticamente() {
        LocalDate hoy = LocalDate.now();

        // Consulta directa por fecha — evita cargar todos los reportes históricos
        if (reporteRepository.findByFecha(hoy).isPresent()) return;

        LocalDateTime inicioDia = hoy.atStartOfDay();
        LocalDateTime finDia = hoy.atTime(23, 59, 59);
        int totalTransacciones = transaccionRepository.findByFechaBetween(inicioDia, finDia).size();
        if (totalTransacciones == 0) return;

        reporteService.generarCierreDeCaja();
    }
}

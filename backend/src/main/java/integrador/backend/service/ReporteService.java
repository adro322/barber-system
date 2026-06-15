package integrador.backend.service;

import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.repository.ReporteRepository;
import integrador.backend.repository.TransaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Autowired
    private EmailService emailService;

    // Calcula el resumen del dia sin guardar en BD (usar para Excel y consultas)
    public Reporte calcularResumenDeHoy() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        List<Transaccion> transaccionesDelDia = transaccionRepository.findByFechaBetween(inicioDia, finDia);

        BigDecimal totalEfectivo = BigDecimal.ZERO;
        BigDecimal totalYape = BigDecimal.ZERO;
        BigDecimal totalPlin = BigDecimal.ZERO;
        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (Transaccion t : transaccionesDelDia) {
            BigDecimal monto = t.getMonto();
            totalGeneral = totalGeneral.add(monto);
            switch (t.getTipoPago()) {
                case "EFECTIVO" -> totalEfectivo = totalEfectivo.add(monto);
                case "YAPE"     -> totalYape     = totalYape.add(monto);
                case "PLIN"     -> totalPlin     = totalPlin.add(monto);
            }
        }

        Reporte resumen = new Reporte();
        resumen.setFecha(LocalDate.now());
        resumen.setTotalEfectivo(totalEfectivo);
        resumen.setTotalYape(totalYape);
        resumen.setTotalPlin(totalPlin);
        resumen.setTotalGeneral(totalGeneral);
        return resumen;
    }

    // Guarda el cierre oficial del dia en BD y envia email al admin
    public Reporte generarCierreDeCaja() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().atTime(23, 59, 59);
        List<Transaccion> transaccionesDelDia = transaccionRepository.findByFechaBetween(inicioDia, finDia);

        BigDecimal totalEfectivo = BigDecimal.ZERO;
        BigDecimal totalYape = BigDecimal.ZERO;
        BigDecimal totalPlin = BigDecimal.ZERO;
        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (Transaccion t : transaccionesDelDia) {
            BigDecimal monto = t.getMonto();
            totalGeneral = totalGeneral.add(monto);
            switch (t.getTipoPago()) {
                case "EFECTIVO" -> totalEfectivo = totalEfectivo.add(monto);
                case "YAPE"     -> totalYape     = totalYape.add(monto);
                case "PLIN"     -> totalPlin     = totalPlin.add(monto);
            }
        }

        Reporte cierre = new Reporte();
        cierre.setFecha(LocalDate.now());
        cierre.setTotalEfectivo(totalEfectivo);
        cierre.setTotalYape(totalYape);
        cierre.setTotalPlin(totalPlin);
        cierre.setTotalGeneral(totalGeneral);

        Reporte guardado = reporteRepository.save(cierre);

        emailService.enviarResumenCierreCaja(
            guardado.getFecha(),
            guardado.getTotalEfectivo(),
            guardado.getTotalYape(),
            guardado.getTotalPlin(),
            guardado.getTotalGeneral(),
            transaccionesDelDia.size()
        );

        return guardado;
    }
}

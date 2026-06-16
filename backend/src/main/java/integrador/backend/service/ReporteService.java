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

    @Autowired private ReporteRepository reporteRepository;
    @Autowired private TransaccionRepository transaccionRepository;
    @Autowired private EmailService emailService;

    private Reporte agregarTransacciones(List<Transaccion> transacciones) {
        BigDecimal totalEfectivo = BigDecimal.ZERO;
        BigDecimal totalYape = BigDecimal.ZERO;
        BigDecimal totalPlin = BigDecimal.ZERO;
        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (Transaccion t : transacciones) {
            BigDecimal monto = t.getMonto();
            totalGeneral = totalGeneral.add(monto);
            if ("MIXTO".equals(t.getTipoPago())) {
                if (t.getMontoEfectivo() != null) totalEfectivo = totalEfectivo.add(t.getMontoEfectivo());
                if (t.getMontoYape()     != null) totalYape     = totalYape.add(t.getMontoYape());
                if (t.getMontoPlin()     != null) totalPlin     = totalPlin.add(t.getMontoPlin());
            } else {
                switch (t.getTipoPago()) {
                    case "EFECTIVO" -> totalEfectivo = totalEfectivo.add(monto);
                    case "YAPE"     -> totalYape     = totalYape.add(monto);
                    case "PLIN"     -> totalPlin     = totalPlin.add(monto);
                }
            }
        }

        Reporte reporte = new Reporte();
        reporte.setFecha(LocalDate.now());
        reporte.setTotalEfectivo(totalEfectivo);
        reporte.setTotalYape(totalYape);
        reporte.setTotalPlin(totalPlin);
        reporte.setTotalGeneral(totalGeneral);
        return reporte;
    }

    private List<Transaccion> transaccionesDeHoy() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fin = LocalDate.now().atTime(23, 59, 59);
        return transaccionRepository.findByFechaBetween(inicio, fin);
    }

    public Reporte calcularResumenDeHoy() {
        return agregarTransacciones(transaccionesDeHoy());
    }

    public Reporte generarCierreDeCaja() {
        List<Transaccion> transacciones = transaccionesDeHoy();
        Reporte cierre = agregarTransacciones(transacciones);
        Reporte guardado = reporteRepository.save(cierre);

        emailService.enviarResumenCierreCaja(
            guardado.getFecha(),
            guardado.getTotalEfectivo(),
            guardado.getTotalYape(),
            guardado.getTotalPlin(),
            guardado.getTotalGeneral(),
            transacciones.size()
        );

        return guardado;
    }
}

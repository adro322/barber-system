package integrador.backend.service;

import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.repository.ReporteRepository;
import integrador.backend.repository.TransaccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private TransaccionRepository transaccionRepository;

    public Reporte generarCierreDeCaja() {
        // Obtenemos todas las transacciones (En producción, filtraríamos por fecha de hoy)
        List<Transaccion> transaccionesDelDia = transaccionRepository.findAll();

        BigDecimal totalEfectivo = BigDecimal.ZERO;
        BigDecimal totalYape = BigDecimal.ZERO;
        BigDecimal totalPlin = BigDecimal.ZERO;
        BigDecimal totalGeneral = BigDecimal.ZERO;

        // Sumamos billete por billete según el método de pago
        for (Transaccion t : transaccionesDelDia) {
            BigDecimal monto = t.getMonto();
            totalGeneral = totalGeneral.add(monto);

            switch (t.getTipoPago()) {
                case "EFECTIVO" -> totalEfectivo = totalEfectivo.add(monto);
                case "YAPE" -> totalYape = totalYape.add(monto);
                case "PLIN" -> totalPlin = totalPlin.add(monto);
            }
        }

        // Creamos la fila resumen en la tabla reportes
        Reporte cierre = new Reporte();
        cierre.setFecha(LocalDate.now());
        cierre.setTotalEfectivo(totalEfectivo);
        cierre.setTotalYape(totalYape);
        cierre.setTotalPlin(totalPlin);
        cierre.setTotalGeneral(totalGeneral);

        return reporteRepository.save(cierre);
    }
}
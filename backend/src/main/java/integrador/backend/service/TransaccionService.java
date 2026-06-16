package integrador.backend.service;

import integrador.backend.entity.DetalleServicio;
import integrador.backend.entity.Insumo;
import integrador.backend.entity.Transaccion;
import integrador.backend.entity.Turno;
import integrador.backend.repository.DetalleServicioRepository;
import integrador.backend.repository.InsumoRepository;
import integrador.backend.repository.TransaccionRepository;
import integrador.backend.repository.TurnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransaccionService {

    @Autowired private TransaccionRepository transaccionRepository;
    @Autowired private TurnoRepository turnoRepository;
    @Autowired private DetalleServicioRepository detalleServicioRepository;
    @Autowired private InsumoRepository insumoRepository;
    @Autowired private EmailService emailService;

    // Descuenta stock de insumos del servicio y devuelve los nombres que quedaron bajo mínimo
    private List<String> descontarStockDeServicio(Long idServicio) {
        List<DetalleServicio> detalles = detalleServicioRepository.findByServicioId(idServicio);
        List<String> insumosEnAlerta = new ArrayList<>();
        List<Insumo> insumosActualizados = new ArrayList<>();

        for (DetalleServicio detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            int nuevoStock = Math.max(0, insumo.getStock() - detalle.getCantidadUsada());
            insumo.setStock(nuevoStock);
            insumosActualizados.add(insumo);
            if (nuevoStock <= insumo.getStockMinimo()) {
                insumosEnAlerta.add(insumo.getNombre() + " (stock: " + nuevoStock + ", mínimo: " + insumo.getStockMinimo() + ")");
            }
        }
        insumoRepository.saveAll(insumosActualizados); // batch en vez de N saves individuales
        return insumosEnAlerta;
    }

    @Transactional
    public Transaccion cobrarTurnoSplit(Long idTurno, BigDecimal efectivo, BigDecimal yape, BigDecimal plin) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if ("FINALIZADO".equals(turno.getEstado()) || "CANCELADO".equals(turno.getEstado())) {
            throw new RuntimeException("Este turno ya fue cobrado o está cancelado.");
        }

        BigDecimal e = efectivo != null ? efectivo : BigDecimal.ZERO;
        BigDecimal y = yape     != null ? yape     : BigDecimal.ZERO;
        BigDecimal p = plin     != null ? plin     : BigDecimal.ZERO;
        BigDecimal total = e.add(y).add(p);

        BigDecimal precio = turno.getServicio().getPrecio();
        if (total.compareTo(precio) != 0) {
            throw new RuntimeException("El total ingresado (S/. " + total + ") no coincide con el precio del servicio (S/. " + precio + ").");
        }

        List<String> insumosEnAlerta = descontarStockDeServicio(turno.getServicio().getId());
        if (!insumosEnAlerta.isEmpty()) {
            try { emailService.enviarAlertaStockBajo(insumosEnAlerta); } catch (Exception ignored) {}
        }

        int metodosUsados = (e.compareTo(BigDecimal.ZERO) > 0 ? 1 : 0)
                          + (y.compareTo(BigDecimal.ZERO) > 0 ? 1 : 0)
                          + (p.compareTo(BigDecimal.ZERO) > 0 ? 1 : 0);

        Transaccion pago = new Transaccion();
        pago.setTurno(turno);
        pago.setBarbero(turno.getBarbero());
        pago.setMonto(total);
        pago.setFecha(LocalDateTime.now());

        if (metodosUsados <= 1) {
            if (e.compareTo(BigDecimal.ZERO) > 0) pago.setTipoPago("EFECTIVO");
            else if (y.compareTo(BigDecimal.ZERO) > 0) pago.setTipoPago("YAPE");
            else pago.setTipoPago("PLIN");
        } else {
            pago.setTipoPago("MIXTO");
            pago.setMontoEfectivo(e.compareTo(BigDecimal.ZERO) > 0 ? e : null);
            pago.setMontoYape(y.compareTo(BigDecimal.ZERO) > 0 ? y : null);
            pago.setMontoPlin(p.compareTo(BigDecimal.ZERO) > 0 ? p : null);
        }

        turno.setEstado("FINALIZADO");
        turnoRepository.save(turno);
        return transaccionRepository.save(pago);
    }

    public List<Transaccion> listarPorPeriodo(String desde, String hasta) {
        LocalDateTime inicio = (desde != null)
            ? LocalDate.parse(desde).atStartOfDay()
            : LocalDate.now().atStartOfDay();
        LocalDateTime fin = (hasta != null)
            ? LocalDate.parse(hasta).atTime(23, 59, 59)
            : LocalDate.now().atTime(23, 59, 59);
        return transaccionRepository.findByFechaBetween(inicio, fin);
    }
}

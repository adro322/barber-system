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

    public Transaccion cobrarTurno(Long idTurno, String tipoPago) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if ("FINALIZADO".equals(turno.getEstado()) || "CANCELADO".equals(turno.getEstado())) {
            throw new RuntimeException("Este turno ya fue cobrado o está cancelado.");
        }

        // Descuento de stock y deteccion de insumos bajo minimo
        List<DetalleServicio> detalles = detalleServicioRepository.findByServicioId(turno.getServicio().getId());
        List<String> insumosEnAlerta = new ArrayList<>();

        for (DetalleServicio detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            int nuevoStock = Math.max(0, insumo.getStock() - detalle.getCantidadUsada());
            insumo.setStock(nuevoStock);
            insumoRepository.save(insumo);

            if (nuevoStock <= insumo.getStockMinimo()) {
                insumosEnAlerta.add(insumo.getNombre() + " (stock: " + nuevoStock + ", mínimo: " + insumo.getStockMinimo() + ")");
            }
        }

        // Enviar alerta si hay insumos bajo minimo (sin bloquear el cobro si falla el email)
        if (!insumosEnAlerta.isEmpty()) {
            try { emailService.enviarAlertaStockBajo(insumosEnAlerta); } catch (Exception ignored) {}
        }

        // Registro del pago
        Transaccion pago = new Transaccion();
        pago.setTurno(turno);
        pago.setBarbero(turno.getBarbero());
        pago.setMonto(turno.getServicio().getPrecio());
        pago.setTipoPago(tipoPago.toUpperCase());
        pago.setFecha(LocalDateTime.now());

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

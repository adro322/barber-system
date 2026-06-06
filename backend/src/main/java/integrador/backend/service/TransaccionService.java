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
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransaccionService {

    @Autowired private TransaccionRepository transaccionRepository;
    @Autowired private TurnoRepository turnoRepository;
    @Autowired private DetalleServicioRepository detalleServicioRepository;
    @Autowired private InsumoRepository insumoRepository;

    public Transaccion cobrarTurno(Long idTurno, String tipoPago) {
        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new RuntimeException("Turno no encontrado"));

        if (turno.getEstado().equals("FINALIZADO")) {
            throw new RuntimeException("Este turno ya fue cobrado.");
        }

        //DESCUENTO DE STOCK AUTOMÁTICO
        List<DetalleServicio> detalles = detalleServicioRepository.findByServicioId(turno.getServicio().getId());
        for (DetalleServicio detalle : detalles) {
            Insumo insumo = detalle.getInsumo();
            int nuevoStock = insumo.getStock() - detalle.getCantidadUsada();
            insumo.setStock(nuevoStock);
            insumoRepository.save(insumo); // Actualiza la BD
        }

        //REGISTRO DEL PAGO
        Transaccion pago = new Transaccion();
        pago.setTurno(turno);
        pago.setBarbero(turno.getBarbero());
        pago.setMonto(turno.getServicio().getPrecio());
        pago.setTipoPago(tipoPago.toUpperCase());
        pago.setFecha(LocalDateTime.now());

        //ACTUALIZAR ESTADO DEL TURNO
        turno.setEstado("FINALIZADO");
        turnoRepository.save(turno);

        return transaccionRepository.save(pago);
    }
}
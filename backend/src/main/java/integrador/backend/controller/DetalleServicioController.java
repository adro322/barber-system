package integrador.backend.controller;

import integrador.backend.entity.DetalleServicio;
import integrador.backend.entity.Insumo;
import integrador.backend.entity.Servicio;
import integrador.backend.repository.DetalleServicioRepository;
import integrador.backend.repository.InsumoRepository;
import integrador.backend.repository.ServicioRepository;
import integrador.backend.service.EventoBroadcaster;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalle-servicio")
public class DetalleServicioController {

    @Autowired private DetalleServicioRepository detalleServicioRepository;
    @Autowired private ServicioRepository servicioRepository;
    @Autowired private InsumoRepository insumoRepository;
    @Autowired private EventoBroadcaster broadcaster;

    @GetMapping
    public ResponseEntity<List<DetalleServicio>> listar() {
        return ResponseEntity.ok(detalleServicioRepository.findAll());
    }

    @PostMapping("/insumo/{insumoId}/activar")
    public ResponseEntity<String> activar(@PathVariable Long insumoId) {
        Insumo insumo = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        detalleServicioRepository.deleteByInsumoId(insumoId);
        List<Servicio> servicios = servicioRepository.findAll();
        for (Servicio servicio : servicios) {
            DetalleServicio d = new DetalleServicio();
            d.setServicio(servicio);
            d.setInsumo(insumo);
            d.setCantidadUsada(1);
            detalleServicioRepository.save(d);
        }
        broadcaster.broadcast();
        return ResponseEntity.ok("Descuento automático activado");
    }

    @DeleteMapping("/insumo/{insumoId}/desactivar")
    public ResponseEntity<String> desactivar(@PathVariable Long insumoId) {
        detalleServicioRepository.deleteByInsumoId(insumoId);
        broadcaster.broadcast();
        return ResponseEntity.ok("Descuento automático desactivado");
    }
}

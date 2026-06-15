package integrador.backend.service;

import integrador.backend.entity.Insumo;
import integrador.backend.repository.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    public Insumo guardarInsumo(Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    public List<Insumo> listarTodos() {
        return insumoRepository.findAll();
    }

    public Insumo actualizarInsumo(Long id, Insumo datos) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        if (datos.getNombre() != null) insumo.setNombre(datos.getNombre());
        if (datos.getUnidad() != null) insumo.setUnidad(datos.getUnidad());
        if (datos.getStock() != null) insumo.setStock(datos.getStock());
        if (datos.getStockMinimo() != null) insumo.setStockMinimo(datos.getStockMinimo());
        return insumoRepository.save(insumo);
    }

    public void eliminarInsumo(Long id) {
        insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        insumoRepository.deleteById(id);
    }

    public Insumo descontarStock(Long id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        insumo.setStock(Math.max(0, insumo.getStock() - 1));
        return insumoRepository.save(insumo);
    }

    public List<Insumo> obtenerInsumosEnAlerta() {
        return insumoRepository.findInsumosEnAlerta();
    }
}

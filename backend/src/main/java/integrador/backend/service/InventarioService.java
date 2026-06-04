package integrador.backend.service;

import integrador.backend.dto.InsumoRequest;
import integrador.backend.entity.Insumo;
import integrador.backend.repository.InsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InsumoRepository insumoRepository;

    public List<Insumo> listarTodos() {
        return insumoRepository.findAll();
    }

    public List<Insumo> listarCriticos() {
        return insumoRepository.findAll().stream()
                .filter(i -> i.getStock() <= i.getStockMinimo())
                .toList();
    }

    @Transactional
    public Insumo crear(InsumoRequest request) {
        Insumo insumo = Insumo.builder()
                .nombre(request.getNombre())
                .stock(request.getStock())
                .stockMinimo(request.getStockMinimo())
                .unidad(request.getUnidad())
                .build();
        return insumoRepository.save(insumo);
    }

    @Transactional
    public Insumo actualizar(Long id, InsumoRequest request) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
        insumo.setNombre(request.getNombre());
        insumo.setStock(request.getStock());
        insumo.setStockMinimo(request.getStockMinimo());
        insumo.setUnidad(request.getUnidad());
        return insumoRepository.save(insumo);
    }
}

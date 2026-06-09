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
    
    public List<Insumo> obtenerInsumosEnAlerta() {
        // Fijamos el umbral en 10 como pediste
        return insumoRepository.findByStockLessThanEqual(10);
    }
}
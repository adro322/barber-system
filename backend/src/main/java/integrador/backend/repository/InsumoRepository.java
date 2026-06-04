package integrador.backend.repository;

import integrador.backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    List<Insumo> findByStockLessThanEqual(Integer stockMinimo);
}

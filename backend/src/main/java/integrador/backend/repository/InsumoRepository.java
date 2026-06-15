package integrador.backend.repository;

import integrador.backend.entity.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Long> {
    @Query("SELECT i FROM Insumo i WHERE i.stock <= i.stockMinimo")
    List<Insumo> findInsumosEnAlerta();
}

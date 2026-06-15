package integrador.backend.repository;

import integrador.backend.entity.DetalleServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface DetalleServicioRepository extends JpaRepository<DetalleServicio, Long> {
    List<DetalleServicio> findByServicioId(Long idServicio);
    List<DetalleServicio> findByInsumoId(Long idInsumo);
    void deleteByInsumoId(Long idInsumo);
}
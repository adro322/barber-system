package integrador.backend.repository;

import integrador.backend.entity.DetalleServicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleServicioRepository extends JpaRepository<DetalleServicio, Long> {
    List<DetalleServicio> findByServicioId(Long servicioId);
}

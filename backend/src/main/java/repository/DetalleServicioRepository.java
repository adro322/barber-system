package integrador.backend.repository;

import integrador.backend.entity.DetalleServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleServicioRepository extends JpaRepository<DetalleServicio, Long> {
}
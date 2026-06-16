package integrador.backend.repository;

import integrador.backend.entity.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    java.util.List<Reporte> findAllByOrderByFechaDesc();
    java.util.Optional<Reporte> findByFecha(java.time.LocalDate fecha);
}
package integrador.backend.repository;

import integrador.backend.entity.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    Optional<Reporte> findByFecha(LocalDate fecha);
}

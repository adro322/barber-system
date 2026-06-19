package integrador.backend.repository;

import integrador.backend.entity.SesionCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface SesionCajaRepository extends JpaRepository<SesionCaja, Long> {
    Optional<SesionCaja> findByFecha(LocalDate fecha);
}

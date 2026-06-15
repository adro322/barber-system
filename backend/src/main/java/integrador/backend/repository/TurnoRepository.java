package integrador.backend.repository;

import integrador.backend.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {
    List<Turno> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}

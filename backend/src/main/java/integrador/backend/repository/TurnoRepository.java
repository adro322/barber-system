package integrador.backend.repository;

import integrador.backend.entity.Turno;
import integrador.backend.enums.EstadoTurno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurnoRepository extends JpaRepository<Turno, Long> {
    List<Turno> findByEstadoIn(List<EstadoTurno> estados);
    List<Turno> findByBarberoIdAndEstadoIn(Long barberoId, List<EstadoTurno> estados);
}

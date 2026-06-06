package integrador.backend.repository;

import integrador.backend.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    List<Servicio> findByBarberoId(Long barberoId);
}

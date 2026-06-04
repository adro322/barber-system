package integrador.backend.repository;

import integrador.backend.entity.Barbero;
import integrador.backend.enums.EstadoBarbero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BarberoRepository extends JpaRepository<Barbero, Long> {
    List<Barbero> findByEstado(EstadoBarbero estado);
}

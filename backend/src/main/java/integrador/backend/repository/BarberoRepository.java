package integrador.backend.repository;

import integrador.backend.entity.Barbero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BarberoRepository extends JpaRepository<Barbero, Long> {
    Optional<Barbero> findByUsuarioEmail(String email);
}
package integrador.backend.repository;

import integrador.backend.entity.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    List<Transaccion> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);
}

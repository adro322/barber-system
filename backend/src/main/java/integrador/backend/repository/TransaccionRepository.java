package integrador.backend.repository;

import integrador.backend.entity.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    List<Transaccion> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT t FROM Transaccion t WHERE t.barbero.id = :barberoId AND t.fecha BETWEEN :inicio AND :fin")
    List<Transaccion> findByBarberoAndFecha(@Param("barberoId") Long barberoId,
                                            @Param("inicio") LocalDateTime inicio,
                                            @Param("fin") LocalDateTime fin);
}

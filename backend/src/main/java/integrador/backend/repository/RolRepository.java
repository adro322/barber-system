package integrador.backend.repository;

import integrador.backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    // Si luego queremos buscar un rol por su nombre ("ADMIN"), lo agregamos aquí
    Optional<Rol> findByNombre(String nombre);
}
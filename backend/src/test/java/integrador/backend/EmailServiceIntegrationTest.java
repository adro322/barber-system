package integrador.backend;

import integrador.backend.entity.Usuario;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class EmailServiceIntegrationTest {

    private UsuarioRepository usuarioRepository;
    private EmailService emailService;
    private Usuario adminPrueba;

    @BeforeEach
    void setUp() throws Exception {
        emailService = new EmailService();
        usuarioRepository = Mockito.mock(UsuarioRepository.class);

        // Inyección por Reflection para evitar colapso del MockMaker
        java.lang.reflect.Field repoField = EmailService.class.getDeclaredField("usuarioRepository");
        repoField.setAccessible(true);
        repoField.set(emailService, usuarioRepository);

        adminPrueba = new Usuario();
        adminPrueba.setEmail("admin@barberia.com");
    }

    @Test
    void testEnviarResumenCierreCaja_PI01() {
        Mockito.when(usuarioRepository.findFirstByRolNombre("ADMIN")).thenReturn(Optional.of(adminPrueba));
        assertDoesNotThrow(() -> {
            emailService.enviarResumenCierreCaja(
                    LocalDate.now(), new BigDecimal("100.00"), BigDecimal.ZERO, BigDecimal.ZERO,
                    new BigDecimal("100.00"), 5);
        });
    }

    @Test
    void testEnviarSolicitudActivacion_PI02() {
        Mockito.when(usuarioRepository.findFirstByRolNombre("ADMIN")).thenReturn(Optional.of(adminPrueba));
        assertDoesNotThrow(() -> {
            emailService.enviarSolicitudActivacion("Carlos Barbero", "carlos@gmail.com");
        });
    }

    @Test
    void testEnviarAlertaStockBajo_PI03() {
        Mockito.when(usuarioRepository.findFirstByRolNombre("ADMIN")).thenReturn(Optional.of(adminPrueba));
        assertDoesNotThrow(() -> {
            emailService.enviarAlertaStockBajo(Arrays.asList("Navaja", "Gel"));
        });
    }

    @Test
    void testEnviarCodigoRecuperacion_CapturaError_PI04() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            emailService.enviarCodigoRecuperacion("usuario@gmail.com", "123456");
        });
        assertNotNull(exception);
    }

    @Test
    void testEnviarAlertaStockBajo_ListaVacia_PI05() {
        // Al enviar una lista vacía, el método debe retornar inmediatamente (early
        // return)
        assertDoesNotThrow(() -> {
            emailService.enviarAlertaStockBajo(Collections.emptyList());
        });
        // Verificamos que NO se haya llamado a la BD porque se abortó antes
        Mockito.verify(usuarioRepository, Mockito.never()).findFirstByRolNombre(Mockito.anyString());
    }
}
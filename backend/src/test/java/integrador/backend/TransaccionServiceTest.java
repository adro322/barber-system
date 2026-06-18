package integrador.backend;

import integrador.backend.entity.Turno;
import integrador.backend.repository.DetalleServicioRepository;
import integrador.backend.repository.InsumoRepository;
import integrador.backend.repository.TransaccionRepository;
import integrador.backend.repository.TurnoRepository;
import integrador.backend.service.EmailService;
import integrador.backend.service.TransaccionService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TransaccionServiceTest {

    @Mock private TurnoRepository turnoRepository;
    @Mock private TransaccionRepository transaccionRepository;
    @Mock private DetalleServicioRepository detalleServicioRepository;
    @Mock private InsumoRepository insumoRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private TransaccionService transaccionService;

    // PRUEBA P-01
    @Test
    void cobrarTurnoSplit_CuandoTurnoNoExiste_LanzaExcepcion() {
        Long idTurnoInexistente = 999L;
        when(turnoRepository.findById(idTurnoInexistente)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            transaccionService.cobrarTurnoSplit(idTurnoInexistente, BigDecimal.TEN, BigDecimal.ZERO, BigDecimal.ZERO)
        );

        assertEquals("Turno no encontrado", exception.getMessage());
    }

    // PRUEBA P-02
    @Test
    void cobrarTurnoSplit_CuandoTurnoYaEstaFinalizado_LanzaExcepcion() {
        Long idTurno = 1L;
        Turno turnoFinalizado = new Turno();
        turnoFinalizado.setEstado("FINALIZADO");

        when(turnoRepository.findById(idTurno)).thenReturn(Optional.of(turnoFinalizado));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            transaccionService.cobrarTurnoSplit(idTurno, BigDecimal.TEN, BigDecimal.ZERO, BigDecimal.ZERO)
        );

        assertEquals("Este turno ya fue cobrado o está cancelado.", exception.getMessage());
    }
}
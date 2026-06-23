package integrador.backend;

import integrador.backend.entity.*;
import integrador.backend.repository.*;
import integrador.backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransaccionServiceIntegrationTest {

    @Mock
    private TransaccionRepository transaccionRepository;
    @Mock
    private TurnoRepository turnoRepository;
    @Mock
    private DetalleServicioRepository detalleServicioRepository;
    @Mock
    private InsumoRepository insumoRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private TransaccionService transaccionService;

    private Turno turnoPrueba;
    private Servicio servicioPrueba;
    private Insumo insumoPrueba;
    private DetalleServicio detallePrueba;

    @BeforeEach
    void setUp() {
        // 1. Simulamos un Servicio que cuesta S/. 30.00
        servicioPrueba = new Servicio();
        servicioPrueba.setId(1L);
        servicioPrueba.setPrecio(new BigDecimal("30.00"));

        // 2. Simulamos el Turno en espera
        turnoPrueba = new Turno();
        turnoPrueba.setId(1L);
        turnoPrueba.setEstado("ESPERA");
        turnoPrueba.setServicio(servicioPrueba);

        // 3. Simulamos un Insumo asociado
        insumoPrueba = new Insumo();
        insumoPrueba.setId(1L);
        insumoPrueba.setNombre("Navaja");
        insumoPrueba.setStock(10);
        insumoPrueba.setStockMinimo(5);

        // 4. Simulamos el uso de ese insumo en el servicio
        detallePrueba = new DetalleServicio();
        detallePrueba.setInsumo(insumoPrueba);
        detallePrueba.setCantidadUsada(1);
    }

    @Test
    void testCobrarTurno_PagoUnico_PI01() {
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));
        when(detalleServicioRepository.findByServicioId(1L)).thenReturn(Arrays.asList(detallePrueba));
        when(transaccionRepository.save(any(Transaccion.class))).thenAnswer(i -> i.getArguments()[0]);

        Transaccion resultado = transaccionService.cobrarTurnoSplit(1L, new BigDecimal("30.00"), null, null);

        assertNotNull(resultado);
        assertEquals("EFECTIVO", resultado.getTipoPago());
        assertEquals("FINALIZADO", turnoPrueba.getEstado()); // Verifica integración con Turno
        verify(insumoRepository, times(1)).saveAll(anyList()); // Verifica integración con Insumo
    }

    @Test
    void testCobrarTurno_PagoMixto_PI02() {
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));
        when(detalleServicioRepository.findByServicioId(1L)).thenReturn(Arrays.asList(detallePrueba));
        when(transaccionRepository.save(any(Transaccion.class))).thenAnswer(i -> i.getArguments()[0]);

        // Pagamos S/.15 en Efectivo y S/.15 en Yape = Total 30
        Transaccion resultado = transaccionService.cobrarTurnoSplit(1L, new BigDecimal("15.00"),
                new BigDecimal("15.00"), null);

        assertEquals("MIXTO", resultado.getTipoPago());
        assertEquals(new BigDecimal("15.00"), resultado.getMontoEfectivo());
        assertEquals(new BigDecimal("15.00"), resultado.getMontoYape());
    }

    @Test
    void testCobrarTurno_BloqueoCobroDoble_PI03() {
        turnoPrueba.setEstado("FINALIZADO"); // Simulamos que ya se cobró
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            transaccionService.cobrarTurnoSplit(1L, new BigDecimal("30.00"), null, null);
        });

        assertEquals("Este turno ya fue cobrado o está cancelado.", exception.getMessage());
    }

    @Test
    void testCobrarTurno_MontoInvalido_PI04() {
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            // Mandamos S/.20 cuando el servicio cuesta S/.30
            transaccionService.cobrarTurnoSplit(1L, new BigDecimal("20.00"), null, null);
        });

        assertTrue(exception.getMessage().contains("no coincide con el precio del servicio"));
    }

    @Test
    void testListarPorPeriodo_PI05() {
        Transaccion t1 = new Transaccion();
        when(transaccionRepository.findByFechaBetween(any(), any())).thenReturn(Arrays.asList(t1));

        List<Transaccion> resultados = transaccionService.listarPorPeriodo("2026-06-01", "2026-06-30");

        assertFalse(resultados.isEmpty());
        verify(transaccionRepository, times(1)).findByFechaBetween(any(), any());
    }
}
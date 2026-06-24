package integrador.backend;

import integrador.backend.entity.Barbero;
import integrador.backend.entity.Servicio;
import integrador.backend.entity.Turno;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.ServicioRepository;
import integrador.backend.repository.TurnoRepository;
import integrador.backend.service.TurnoService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TurnoServiceTest {

    @Mock
    private TurnoRepository turnoRepository;
    @Mock
    private BarberoRepository barberoRepository;
    @Mock
    private ServicioRepository servicioRepository;

    @InjectMocks
    private TurnoService turnoService;

    private Servicio servicioPrueba;
    private Barbero barberoPrueba;
    private Turno turnoPrueba;

    @BeforeEach
    void setUp() {
        servicioPrueba = new Servicio();
        servicioPrueba.setId(1L);
        servicioPrueba.setPrecio(new BigDecimal("30.00"));

        barberoPrueba = new Barbero();
        barberoPrueba.setId(1L);

        turnoPrueba = new Turno();
        turnoPrueba.setId(1L);
        turnoPrueba.setNombreCliente("Juan Perez");
        turnoPrueba.setServicio(servicioPrueba);
        turnoPrueba.setEstado("ESPERA");
    }

    @Test
    void testCrearTurno_C01() {
        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicioPrueba));
        when(barberoRepository.findById(1L)).thenReturn(Optional.of(barberoPrueba));
        when(turnoRepository.save(any(Turno.class))).thenReturn(turnoPrueba);

        Turno creado = turnoService.crearTurno("Juan Perez", 1L, 1L);

        assertNotNull(creado);
        assertEquals("ESPERA", creado.getEstado());
        verify(turnoRepository, times(1)).save(any(Turno.class));
    }

    @Test
    void testCrearTurno_ServicioNoEncontrado_C02() {
        // Simulamos que buscan un servicio que no existe (ID 99)
        when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            turnoService.crearTurno("Juan Perez", 99L, 1L);
        });

        assertEquals("Servicio no encontrado", ex.getMessage());
    }

    @Test
    void testAsignarBarbero_C03() {
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));
        when(barberoRepository.findById(1L)).thenReturn(Optional.of(barberoPrueba));
        when(turnoRepository.save(any(Turno.class))).thenReturn(turnoPrueba);

        Turno asignado = turnoService.asignarBarbero(1L, 1L);

        assertNotNull(asignado);
        assertEquals("ATENDIENDO", turnoPrueba.getEstado()); // Verifica el cambio de estado
    }

    @Test
    void testCambiarEstado_C04() {
        when(turnoRepository.findById(1L)).thenReturn(Optional.of(turnoPrueba));
        when(turnoRepository.save(any(Turno.class))).thenReturn(turnoPrueba);

        Turno actualizado = turnoService.cambiarEstado(1L, "FINALIZADO");

        assertEquals("FINALIZADO", actualizado.getEstado());
    }

    @Test
    void testListarTurnosDeHoy_C05() {
        // Simulamos la búsqueda por rango de fechas
        when(turnoRepository.findByFechaHoraBetween(any(), any())).thenReturn(Arrays.asList(turnoPrueba));

        List<Turno> lista = turnoService.listarTurnosDeHoy();

        assertFalse(lista.isEmpty());
        verify(turnoRepository, times(1)).findByFechaHoraBetween(any(), any());
    }
}
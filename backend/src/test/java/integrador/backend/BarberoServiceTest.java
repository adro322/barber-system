package integrador.backend;

import integrador.backend.entity.Barbero;
import integrador.backend.entity.Usuario;
import integrador.backend.repository.BarberoRepository;
import integrador.backend.repository.UsuarioRepository;
import integrador.backend.service.BarberoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BarberoServiceTest {

    @Mock
    private BarberoRepository barberoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private BarberoService barberoService;

    private Usuario usuarioPrueba;
    private Barbero barberoPrueba;

    @BeforeEach
    void setUp() {
        // Simulamos un Usuario base
        usuarioPrueba = new Usuario();
        usuarioPrueba.setId(1L);
        usuarioPrueba.setNombre("Carlos Quispe");

        // Simulamos el Barbero enlazado a ese Usuario
        barberoPrueba = new Barbero();
        barberoPrueba.setId(1L);
        barberoPrueba.setUsuario(usuarioPrueba);
        barberoPrueba.setNombre(usuarioPrueba.getNombre());
        barberoPrueba.setTelefono("987654321");
        barberoPrueba.setEstado("ACTIVO");
    }

    @Test
    void testCrearPerfilBarbero_PV01() {
        // Simulamos que el usuario existe
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioPrueba));
        // Simulamos el guardado
        when(barberoRepository.save(any(Barbero.class))).thenReturn(barberoPrueba);

        Barbero creado = barberoService.crearPerfilBarbero(1L, "987654321");

        assertNotNull(creado);
        assertEquals("Carlos Quispe", creado.getNombre());
        assertEquals("ACTIVO", creado.getEstado());
        verify(barberoRepository, times(1)).save(any(Barbero.class));
    }

    @Test
    void testObtenerTodos_PV02() {
        when(barberoRepository.findAll()).thenReturn(Arrays.asList(barberoPrueba));

        List<Barbero> lista = barberoService.obtenerTodos();

        assertFalse(lista.isEmpty());
        assertEquals(1, lista.size());
        verify(barberoRepository, times(1)).findAll();
    }

    @Test
    void testActualizarBarbero_PV03() {
        when(barberoRepository.findById(1L)).thenReturn(Optional.of(barberoPrueba));
        // Al actualizar nombre de barbero, tu código también actualiza el Usuario
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioPrueba);
        when(barberoRepository.save(any(Barbero.class))).thenReturn(barberoPrueba);

        Barbero actualizado = barberoService.actualizarBarbero(1L, "Carlos Modificado", "999888777");

        assertNotNull(actualizado);
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
        verify(barberoRepository, times(1)).save(barberoPrueba);
    }

    @Test
    void testCambiarEstado_PV04() {
        when(barberoRepository.findById(1L)).thenReturn(Optional.of(barberoPrueba));
        when(barberoRepository.save(any(Barbero.class))).thenReturn(barberoPrueba);

        Barbero inactivo = barberoService.cambiarEstado(1L, "INACTIVO");

        assertEquals("INACTIVO", inactivo.getEstado());
        verify(barberoRepository, times(1)).save(barberoPrueba);
    }

    @Test
    void testEliminarBarbero_PV05() {
        when(barberoRepository.findById(1L)).thenReturn(Optional.of(barberoPrueba));
        doNothing().when(barberoRepository).delete(barberoPrueba);
        doNothing().when(usuarioRepository).delete(usuarioPrueba);

        barberoService.eliminarBarbero(1L);

        // Verifica que la transacción elimine tanto al barbero como a su credencial de
        // usuario
        verify(barberoRepository, times(1)).delete(barberoPrueba);
        verify(usuarioRepository, times(1)).delete(usuarioPrueba);
    }
}
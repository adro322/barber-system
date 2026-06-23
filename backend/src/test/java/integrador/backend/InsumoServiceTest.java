package integrador.backend;

import integrador.backend.entity.Insumo;
import integrador.backend.repository.InsumoRepository;
import integrador.backend.service.InsumoService;
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
public class InsumoServiceTest {

    @Mock
    private InsumoRepository insumoRepository;

    @InjectMocks
    private InsumoService insumoService;

    private Insumo insumoPrueba;

    @BeforeEach
    void setUp() {
        insumoPrueba = new Insumo();
        insumoPrueba.setId(1L);
        insumoPrueba.setNombre("Navaja de afeitar");
        insumoPrueba.setStock(50);
        insumoPrueba.setStockMinimo(10); // Agregado para que coincida con tu lógica
    }

    @Test
    void testCrearInsumo_P01() {
        when(insumoRepository.save(any(Insumo.class))).thenReturn(insumoPrueba);

        Insumo guardado = insumoService.guardarInsumo(insumoPrueba);

        assertNotNull(guardado);
        assertEquals("Navaja de afeitar", guardado.getNombre());
        verify(insumoRepository, times(1)).save(insumoPrueba);
    }

    @Test
    void testListarTodos_P02() {
        when(insumoRepository.findAll()).thenReturn(Arrays.asList(insumoPrueba));

        List<Insumo> lista = insumoService.listarTodos();

        assertFalse(lista.isEmpty());
        assertEquals(1, lista.size());
        verify(insumoRepository, times(1)).findAll();
    }

    @Test
    void testActualizarInsumo_P03() {
        Insumo datosActualizados = new Insumo();
        datosActualizados.setStock(40);

        // Tu código primero busca el insumo y luego lo guarda
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumoPrueba));
        when(insumoRepository.save(any(Insumo.class))).thenReturn(insumoPrueba);

        Insumo actualizado = insumoService.actualizarInsumo(1L, datosActualizados);

        assertNotNull(actualizado);
        verify(insumoRepository, times(1)).findById(1L);
        verify(insumoRepository, times(1)).save(insumoPrueba);
    }

    @Test
    void testEliminarInsumo_P04() {
        // Tu código primero busca si existe antes de eliminar
        when(insumoRepository.findById(1L)).thenReturn(Optional.of(insumoPrueba));
        doNothing().when(insumoRepository).deleteById(1L);

        insumoService.eliminarInsumo(1L);

        verify(insumoRepository, times(1)).findById(1L);
        verify(insumoRepository, times(1)).deleteById(1L);
    }

    @Test
    void testAlertaStockBajo_P05() {
        Insumo insumoBajo = new Insumo();
        insumoBajo.setNombre("Crema de afeitar");
        insumoBajo.setStock(5);
        insumoBajo.setStockMinimo(10);

        // Llama a tu @Query personalizada
        when(insumoRepository.findInsumosEnAlerta()).thenReturn(Arrays.asList(insumoBajo));

        List<Insumo> alertas = insumoService.obtenerInsumosEnAlerta();

        assertFalse(alertas.isEmpty());
        assertEquals(1, alertas.size());
        assertEquals("Crema de afeitar", alertas.get(0).getNombre());
        verify(insumoRepository, times(1)).findInsumosEnAlerta();
    }
}
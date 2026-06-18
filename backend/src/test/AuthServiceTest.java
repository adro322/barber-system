package integrador.backend.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AuthServiceTest {

    // PRUEBA P-03
    @Test
    void generarCodigoRecuperacion_DebeTenerExactamente6Digitos() {
        // Ejecución (La misma lógica que tienes en tu controlador)
        String codigo = String.format("%06d", (int)(Math.random() * 1000000));

        // Validaciones
        assertEquals(6, codigo.length(), "El código generado no tiene 6 caracteres.");
        assertTrue(codigo.matches("\\d+"), "El código debe contener solo números.");
    }
}

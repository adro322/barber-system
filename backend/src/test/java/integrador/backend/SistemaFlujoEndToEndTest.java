package integrador.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas de Sistema — flujo end-to-end sobre el backend real con Supabase.
 * Antes de ejecutar, actualiza las constantes de credenciales e IDs
 * para que coincidan con los datos reales de tu base de datos.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SistemaFlujoEndToEndTest {

    @LocalServerPort
    private int port;

    // RestTemplate configurado para no lanzar excepción en respuestas 4xx/5xx
    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static RestTemplate buildRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public boolean hasError(HttpStatusCode statusCode) { return false; }
        });
        return rt;
    }

    // ─── Actualiza estos valores con los de tu BD de Supabase ────────────────
    private static final String EMAIL_ADMIN    = "paoloandree789@gmail.com";
    private static final String PASS_ADMIN     = "Gaspi2026";
    private static final String EMAIL_BARBERO  = "miguel@barberia.com";
    private static final String PASS_BARBERO   = "Miguel123";
    private static final Long   ID_SERVICIO    = 1L;   // ID del servicio en la BD
    private static final Long   ID_BARBERO     = 1L;   // ID del barbero en la BD
    private static final Long   ID_INSUMO      = 1L;   // ID de un insumo asociado al servicio

    // Se llena automáticamente en PS-01 leyendo el precio real desde /api/servicios
    private static BigDecimal PRECIO_SERVICIO;
    // ─────────────────────────────────────────────────────────────────────────

    // Estado compartido entre pruebas (se llenan en orden PS-01 → PS-02 → PS-03)
    private static String tokenAdmin;
    private static String tokenBarbero;
    private static Long turnoIdPS01;
    private static Long turnoIdPS02;
    private static Long turnoIdPS03;
    private static int stockAntesPS02;

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    private HttpHeaders headersAuth(String token) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(token);
        return h;
    }

    private String login(String email, String password) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("contrasena", password);

        ResponseEntity<String> resp = restTemplate.postForEntity(
                url("/api/auth/login"),
                new HttpEntity<>(body),
                String.class);

        assertEquals(HttpStatus.OK, resp.getStatusCode(),
                "Login fallido para " + email + ". Respuesta: " + resp.getBody());
        Map<String, Object> data = mapper.readValue(resp.getBody(), new TypeReference<>() {});
        return (String) data.get("token");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PS-01: Flujo completo — apertura de caja, registro, atención y cobro
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(1)
    @DisplayName("PS-01: Flujo completo — apertura de caja, registro de cliente, atención y cobro")
    void PS01_flujoCompleto_aperturaHastaTransaccion() throws Exception {

        // Paso 1: Admin inicia sesión y obtiene token JWT
        tokenAdmin = login(EMAIL_ADMIN, PASS_ADMIN);
        assertNotNull(tokenAdmin, "Token admin no debe ser nulo");

        // Paso 2: Leer el precio real del servicio desde la BD
        ResponseEntity<String> serviciosResp = restTemplate.exchange(
                url("/api/servicios"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, serviciosResp.getStatusCode(), "No se pudo obtener servicios");
        List<Map<String, Object>> servicios = mapper.readValue(serviciosResp.getBody(), new TypeReference<>() {});
        Map<String, Object> servicio = servicios.stream()
                .filter(s -> ((Number) s.get("id")).longValue() == ID_SERVICIO)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Servicio ID=" + ID_SERVICIO + " no encontrado en BD"));
        PRECIO_SERVICIO = new BigDecimal(servicio.get("precio").toString());

        // Paso 3: Admin abre la caja del día
        // (idempotente: si ya está abierta la actualiza, no lanza error)
        ResponseEntity<String> sesionResp = restTemplate.exchange(
                url("/api/caja/sesion/abrir"),
                HttpMethod.POST,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, sesionResp.getStatusCode(), "Apertura de caja falló");
        Map<String, Object> sesion = mapper.readValue(sesionResp.getBody(), new TypeReference<>() {});
        assertEquals("ABIERTA", sesion.get("estado"), "La sesión de caja debe quedar en estado ABIERTA");

        // Paso 3: Admin registra un cliente en la cola
        String urlTurno = url("/api/turnos?cliente=TEST_PS01_Carlos&idServicio="
                + ID_SERVICIO + "&idBarbero=" + ID_BARBERO);
        ResponseEntity<String> turnoResp = restTemplate.exchange(
                urlTurno, HttpMethod.POST,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, turnoResp.getStatusCode(), "Creación de turno falló");
        Map<String, Object> turno = mapper.readValue(turnoResp.getBody(), new TypeReference<>() {});
        turnoIdPS01 = ((Number) turno.get("id")).longValue();
        assertEquals("ESPERA", turno.get("estado"), "El turno recién creado debe tener estado ESPERA");

        // Paso 4: Barbero inicia sesión
        tokenBarbero = login(EMAIL_BARBERO, PASS_BARBERO);
        assertNotNull(tokenBarbero, "Token barbero no debe ser nulo");

        // Paso 5: Barbero consulta la cola y verifica que el turno aparece
        ResponseEntity<String> colaResp = restTemplate.exchange(
                url("/api/turnos"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenBarbero)),
                String.class);
        assertEquals(HttpStatus.OK, colaResp.getStatusCode());
        List<Map<String, Object>> cola = mapper.readValue(colaResp.getBody(), new TypeReference<>() {});
        boolean turnoEnCola = cola.stream()
                .anyMatch(t -> ((Number) t.get("id")).longValue() == turnoIdPS01);
        assertTrue(turnoEnCola, "El turno PS-01 debe aparecer en la cola del día");

        // Paso 6: Barbero registra el cobro del servicio en efectivo
        // cobrarTurnoSplit marca el turno como FINALIZADO y descuenta inventario
        Map<String, Object> cobro = new HashMap<>();
        cobro.put("idTurno", turnoIdPS01);
        cobro.put("efectivo", PRECIO_SERVICIO);
        cobro.put("yape", BigDecimal.ZERO);
        cobro.put("plin", BigDecimal.ZERO);

        ResponseEntity<String> cobroResp = restTemplate.exchange(
                url("/api/caja/cobrar-split"), HttpMethod.POST,
                new HttpEntity<>(cobro, headersAuth(tokenBarbero)),
                String.class);
        assertEquals(HttpStatus.OK, cobroResp.getStatusCode(), "Registro de cobro falló");
        Map<String, Object> transaccion = mapper.readValue(cobroResp.getBody(), new TypeReference<>() {});
        assertNotNull(transaccion.get("id"), "La transacción debe tener un ID generado");
        assertEquals("EFECTIVO", transaccion.get("tipoPago"), "El tipo de pago debe ser EFECTIVO");

        // Paso 7: Admin verifica que la transacción aparece en el listado de caja
        ResponseEntity<String> listResp = restTemplate.exchange(
                url("/api/caja/transacciones"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, listResp.getStatusCode());
        List<Map<String, Object>> transacciones = mapper.readValue(listResp.getBody(), new TypeReference<>() {});
        long transaccionId = ((Number) transaccion.get("id")).longValue();
        boolean existeEnCaja = transacciones.stream()
                .anyMatch(t -> ((Number) t.get("id")).longValue() == transaccionId);
        assertTrue(existeEnCaja, "La transacción debe aparecer en el listado de caja del día");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PS-02: El cobro descuenta automáticamente el inventario de insumos
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(2)
    @DisplayName("PS-02: El cobro de un turno descuenta automáticamente el stock del inventario")
    void PS02_cobro_descontaInventarioAutomaticamente() throws Exception {

        // Paso 1: Identificar qué insumo tiene configurado el servicio ID_SERVICIO
        ResponseEntity<String> detalleResp = restTemplate.exchange(
                url("/api/detalle-servicio"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, detalleResp.getStatusCode());
        List<Map<String, Object>> detalles = mapper.readValue(detalleResp.getBody(), new TypeReference<>() {});
        Map<String, Object> detalleDelServicio = detalles.stream()
                .filter(d -> {
                    Map<String, Object> svc = (Map<String, Object>) d.get("servicio");
                    return svc != null && ((Number) svc.get("id")).longValue() == ID_SERVICIO;
                })
                .findFirst()
                .orElse(null);

        // Si el servicio no tiene insumos configurados, el test se omite con aviso
        org.junit.jupiter.api.Assumptions.assumeTrue(detalleDelServicio != null,
                "Servicio ID=" + ID_SERVICIO + " no tiene insumos en detalle_servicio; prueba omitida.");

        Map<String, Object> insumoDelDetalle = (Map<String, Object>) detalleDelServicio.get("insumo");
        long insumoId = ((Number) insumoDelDetalle.get("id")).longValue();

        // Paso 2: Consultar el stock de ese insumo antes del cobro
        ResponseEntity<String> insumosAntes = restTemplate.exchange(
                url("/api/insumos"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, insumosAntes.getStatusCode());
        List<Map<String, Object>> listaAntes = mapper.readValue(insumosAntes.getBody(), new TypeReference<>() {});
        Map<String, Object> insumoAntes = listaAntes.stream()
                .filter(i -> ((Number) i.get("id")).longValue() == insumoId)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Insumo ID=" + insumoId + " no encontrado"));
        stockAntesPS02 = ((Number) insumoAntes.get("stock")).intValue();

        // Paso 2b: Asegurar que el insumo tiene stock suficiente para que se pueda descontar
        Map<String, Object> insumoActualizado = new HashMap<>(insumoAntes);
        insumoActualizado.put("stock", 10);
        restTemplate.exchange(
                url("/api/insumos/" + insumoId), HttpMethod.PUT,
                new HttpEntity<>(insumoActualizado, headersAuth(tokenAdmin)),
                String.class);
        stockAntesPS02 = 10;

        // Paso 3: Crear un nuevo turno para esta prueba
        String urlTurno = url("/api/turnos?cliente=TEST_PS02_Stock&idServicio="
                + ID_SERVICIO + "&idBarbero=" + ID_BARBERO);
        ResponseEntity<String> turnoResp = restTemplate.exchange(
                urlTurno, HttpMethod.POST,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, turnoResp.getStatusCode());
        Map<String, Object> turno = mapper.readValue(turnoResp.getBody(), new TypeReference<>() {});
        turnoIdPS02 = ((Number) turno.get("id")).longValue();

        // Paso 3: Cobrar el turno (esto activa el descuento automático de insumos)
        Map<String, Object> cobro = new HashMap<>();
        cobro.put("idTurno", turnoIdPS02);
        cobro.put("efectivo", PRECIO_SERVICIO);
        cobro.put("yape", BigDecimal.ZERO);
        cobro.put("plin", BigDecimal.ZERO);

        ResponseEntity<String> cobroResp = restTemplate.exchange(
                url("/api/caja/cobrar-split"), HttpMethod.POST,
                new HttpEntity<>(cobro, headersAuth(tokenBarbero)),
                String.class);
        assertEquals(HttpStatus.OK, cobroResp.getStatusCode(), "Cobro PS-02 falló");

        // Paso 4: Consultar el stock del insumo después del cobro
        ResponseEntity<String> insumosDepues = restTemplate.exchange(
                url("/api/insumos"), HttpMethod.GET,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        List<Map<String, Object>> listaDespues = mapper.readValue(insumosDepues.getBody(), new TypeReference<>() {});
        Map<String, Object> insumoDespues = listaDespues.stream()
                .filter(i -> ((Number) i.get("id")).longValue() == insumoId)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Insumo ID=" + insumoId + " no encontrado tras cobro"));
        int stockDespues = ((Number) insumoDespues.get("stock")).intValue();

        // Paso 5: Verificar que el stock disminuyó tras el cobro
        assertTrue(stockDespues < stockAntesPS02,
                "El stock debe disminuir tras el cobro. Antes: " + stockAntesPS02
                        + " | Después: " + stockDespues);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PS-03: Cobro con pago mixto registra correctamente los montos parciales
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(3)
    @DisplayName("PS-03: El cobro con pago mixto (Efectivo + Yape) registra los montos parciales correctamente")
    void PS03_cobro_pagoMixtoEfectivoYape() throws Exception {

        // Paso 1: Crear un nuevo turno para esta prueba
        String urlTurno = url("/api/turnos?cliente=TEST_PS03_Mixto&idServicio="
                + ID_SERVICIO + "&idBarbero=" + ID_BARBERO);
        ResponseEntity<String> turnoResp = restTemplate.exchange(
                urlTurno, HttpMethod.POST,
                new HttpEntity<>(headersAuth(tokenAdmin)),
                String.class);
        assertEquals(HttpStatus.OK, turnoResp.getStatusCode());
        Map<String, Object> turno = mapper.readValue(turnoResp.getBody(), new TypeReference<>() {});
        turnoIdPS03 = ((Number) turno.get("id")).longValue();

        // Paso 2: Cobrar con pago mixto — precio dividido en Efectivo + Yape
        // mitad1 + mitad2 = PRECIO exacto (sin error de redondeo)
        BigDecimal mitad1 = PRECIO_SERVICIO.divide(new BigDecimal("2"), 2, java.math.RoundingMode.FLOOR);
        BigDecimal mitad2 = PRECIO_SERVICIO.subtract(mitad1);
        Map<String, Object> cobro = new HashMap<>();
        cobro.put("idTurno", turnoIdPS03);
        cobro.put("efectivo", mitad1);
        cobro.put("yape", mitad2);
        cobro.put("plin", BigDecimal.ZERO);

        ResponseEntity<String> cobroResp = restTemplate.exchange(
                url("/api/caja/cobrar-split"), HttpMethod.POST,
                new HttpEntity<>(cobro, headersAuth(tokenBarbero)),
                String.class);
        assertEquals(HttpStatus.OK, cobroResp.getStatusCode(), "Cobro mixto PS-03 falló");
        Map<String, Object> transaccion = mapper.readValue(cobroResp.getBody(), new TypeReference<>() {});

        // Paso 3: Verificar que el tipo de pago es MIXTO
        assertEquals("MIXTO", transaccion.get("tipoPago"),
                "El tipo de pago debe ser MIXTO cuando se usan dos métodos");

        // Paso 4: Verificar que los montos parciales están correctamente almacenados
        assertNotNull(transaccion.get("montoEfectivo"),
                "montoEfectivo no debe ser nulo en un pago MIXTO con efectivo");
        assertNotNull(transaccion.get("montoYape"),
                "montoYape no debe ser nulo en un pago MIXTO con Yape");
        assertNull(transaccion.get("montoPlin"),
                "montoPlin debe ser nulo si no se usó Plin en este cobro");

        // Paso 5: Verificar que el monto total es correcto
        double montoTotal = ((Number) transaccion.get("monto")).doubleValue();
        assertEquals(PRECIO_SERVICIO.doubleValue(), montoTotal, 0.01,
                "El monto total debe ser S/." + PRECIO_SERVICIO);
    }
}

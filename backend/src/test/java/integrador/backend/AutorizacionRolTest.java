package integrador.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
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

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AutorizacionRolTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String EMAIL_BARBERO = "miguel@barberia.com";
    private static final String PASS_BARBERO  = "Miguel123";

    private String tokenBarbero;

    private static RestTemplate buildRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public boolean hasError(HttpStatusCode statusCode) { return false; }
        });
        return rt;
    }

    private String base() {
        return "http://localhost:" + port;
    }

    private HttpHeaders authHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(tokenBarbero);
        return h;
    }

    @BeforeAll
    void loginComoBarbero() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", EMAIL_BARBERO);
        body.put("contrasena", PASS_BARBERO);

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), h);
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.OK, res.getStatusCode(), "El barbero debe poder hacer login");
        Map<?, ?> json = mapper.readValue(res.getBody(), Map.class);
        tokenBarbero = json.get("token").toString();
        assertNotNull(tokenBarbero, "El token del barbero no debe ser nulo");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AR-01: Barbero no puede abrir/cerrar la caja (solo Admin)
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(1)
    void AR01_barberoNoPuedeAbrirCaja_retorna403() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("estado", "ABIERTA");

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/caja/sesion/abrir", HttpMethod.POST, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Barbero no debe poder abrir caja, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AR-02: Barbero no puede crear ni modificar insumos (solo Admin)
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(2)
    void AR02_barberoNoPuedeCrearInsumo_retorna403() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("nombre", "Insumo Test No Autorizado");
        body.put("stock", 10);
        body.put("stockMinimo", 5);
        body.put("unidad", "unidades");

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/insumos", HttpMethod.POST, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Barbero no debe poder crear insumos, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AR-03: Barbero no puede ver reportes (solo Admin)
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(3)
    void AR03_barberoNoPuedeVerReportes_retorna403() {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/caja/reportes", HttpMethod.GET, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Barbero no debe poder ver reportes, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AR-04: Barbero no puede gestionar usuarios (solo Admin)
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(4)
    void AR04_barberoNoPuedeVerUsuarios_retorna403() {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/usuarios", HttpMethod.GET, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Barbero no debe poder ver usuarios, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AR-05: Barbero SÍ puede ver la cola de turnos (endpoint permitido)
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(5)
    void AR05_barberoSIPuedeVerTurnos_retorna200() {
        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/turnos", HttpMethod.GET, req, String.class);

        assertEquals(HttpStatus.OK, res.getStatusCode(),
                "Barbero sí debe poder ver la cola de turnos");
    }
}

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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ValidacionEntradasTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String EMAIL_ADMIN = "paoloandree789@gmail.com";
    private static final String PASS_ADMIN  = "Gaspi2026";
    private static final Long   ID_SERVICIO = 1L;

    private String tokenAdmin;

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
        h.setBearerAuth(tokenAdmin);
        return h;
    }

    @BeforeAll
    void loginComoAdmin() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", EMAIL_ADMIN);
        body.put("contrasena", PASS_ADMIN);

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), h);
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.OK, res.getStatusCode(), "El admin debe poder hacer login");
        tokenAdmin = mapper.readValue(res.getBody(), Map.class).get("token").toString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VE-01: SQL injection en campo email del login → no causa error 500
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(1)
    void VE01_sqlInjectionEnLogin_noRetorna500() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", "' OR '1'='1'; --");
        body.put("contrasena", "' OR '1'='1");

        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), h);
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertNotEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode(),
                "SQL injection no debe causar error 500 en el servidor");
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode(),
                "SQL injection en login debe retornar 401, no conceder acceso");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VE-02: XSS en nombre de cliente al registrar turno → no causa error 500
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(2)
    void VE02_xssEnNombreCliente_noRetorna500() {
        String xssPayload = "<script>alert('XSS')</script>";

        String url = base() + "/api/turnos?cliente="
                + URLEncoder.encode(xssPayload, StandardCharsets.UTF_8)
                + "&idServicio=" + ID_SERVICIO;

        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.POST, req, String.class);

        assertNotEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode(),
                "Un payload XSS no debe causar error 500 en el servidor");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VE-03: Nombre de cliente vacío al registrar turno → no causa error 500
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(3)
    void VE03_nombreClienteVacio_noRetorna500() {
        String url = base() + "/api/turnos?cliente=&idServicio=" + ID_SERVICIO;

        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode(),
                "Campo cliente vacío debe retornar 400 Bad Request");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VE-04: Nombre de cliente extremadamente largo → no causa error 500
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(4)
    void VE04_nombreClienteMuyLargo_noRetorna500() {
        String nombreLargo = "A".repeat(500);

        String url = base() + "/api/turnos?cliente="
                + URLEncoder.encode(nombreLargo, StandardCharsets.UTF_8)
                + "&idServicio=" + ID_SERVICIO;

        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode(),
                "Nombre de cliente mayor a 100 caracteres debe retornar 400 Bad Request");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VE-05: SQL injection en nombre de cliente → JPA previene la inyección
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(5)
    void VE05_sqlInjectionEnNombreCliente_noRetorna500() {
        String sqlPayload = "Robert'); DROP TABLE turnos; --";

        String url = base() + "/api/turnos?cliente="
                + URLEncoder.encode(sqlPayload, StandardCharsets.UTF_8)
                + "&idServicio=" + ID_SERVICIO;

        HttpEntity<Void> req = new HttpEntity<>(authHeaders());
        ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.POST, req, String.class);

        assertNotEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode(),
                "SQL injection en nombre de cliente no debe causar error 500 — JPA usa queries parametrizadas");
    }
}

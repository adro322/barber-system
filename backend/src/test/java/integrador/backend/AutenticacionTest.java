package integrador.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
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
public class AutenticacionTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = buildRestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String EMAIL_ADMIN = "paoloandree789@gmail.com";
    private static final String PASS_CORRECTA = "Gaspi2026";

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

    private HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AT-01: Login con contraseña incorrecta → 401
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(1)
    void AT01_loginConContrasenaIncorrecta_retorna401() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", EMAIL_ADMIN);
        body.put("contrasena", "ContraseñaEquivocada999");

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), jsonHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode(),
                "Login con contraseña incorrecta debe retornar 401");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AT-02: Login con email inexistente → 401
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(2)
    void AT02_loginConEmailInexistente_retorna401() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", "usuario_que_no_existe@test.com");
        body.put("contrasena", "cualquierClave123");

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), jsonHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode(),
                "Login con email inexistente debe retornar 401");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AT-03: Acceso a endpoint protegido sin token → 403
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(3)
    void AT03_accesoSinToken_retorna403() {
        HttpEntity<Void> req = new HttpEntity<>(new HttpHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/turnos", HttpMethod.GET, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Acceso sin token debe retornar 401 o 403, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AT-04: Acceso a endpoint protegido con token malformado → 401/403
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(4)
    void AT04_accesoConTokenInvalido_retorna401o403() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("esto.no.es.un.jwt.valido");

        HttpEntity<Void> req = new HttpEntity<>(headers);
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/turnos", HttpMethod.GET, req, String.class);

        assertTrue(
                res.getStatusCode() == HttpStatus.FORBIDDEN ||
                res.getStatusCode() == HttpStatus.UNAUTHORIZED,
                "Token malformado debe retornar 401 o 403, obtuvo: " + res.getStatusCode());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AT-05: Login correcto retorna token válido → 200 con token no nulo
    // ─────────────────────────────────────────────────────────────────────────
    @Test
    @Order(5)
    void AT05_loginCorrecto_retornaTokenValido() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("email", EMAIL_ADMIN);
        body.put("contrasena", PASS_CORRECTA);

        HttpEntity<String> req = new HttpEntity<>(mapper.writeValueAsString(body), jsonHeaders());
        ResponseEntity<String> res = restTemplate.exchange(
                base() + "/api/auth/login", HttpMethod.POST, req, String.class);

        assertEquals(HttpStatus.OK, res.getStatusCode(),
                "Login correcto debe retornar 200");

        Map<?, ?> json = mapper.readValue(res.getBody(), Map.class);
        assertNotNull(json.get("token"), "Login correcto debe retornar un token JWT");
        assertFalse(json.get("token").toString().isBlank(), "El token no debe estar vacío");
    }
}

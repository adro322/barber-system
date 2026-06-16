package integrador.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;

@Service
public class EmailService {

    @Value("${email.api.url}")
    private String emailApiUrl;

    @Value("${email.api.secret}")
    private String emailApiSecret;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static String esc(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private void enviar(String destinatario, String asunto, String cuerpo) {
        try {
            String json = "{"
                + "\"to\":\"" + esc(destinatario) + "\","
                + "\"subject\":\"" + esc(asunto) + "\","
                + "\"text\":\"" + esc(cuerpo) + "\""
                + "}";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(emailApiUrl))
                .header("Content-Type", "application/json")
                .header("x-email-secret", emailApiSecret)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                throw new RuntimeException("Email error " + response.statusCode() + ": " + response.body());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo: " + e.getMessage());
        }
    }

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        enviar(
            correoDestino,
            "Código de Recuperación de Contraseña",
            "Hola,\n\nTu código de seguridad de 6 dígitos es: " + codigo +
            "\n\nTienes 15 minutos para usarlo. Si no lo solicitaste, ignora este mensaje."
        );
    }

    public void enviarResumenCierreCaja(LocalDate fecha, BigDecimal totalEfectivo,
            BigDecimal totalYape, BigDecimal totalPlin, BigDecimal totalGeneral, int cantidadAtenciones) {
        try {
            enviar(
                correoAdmin(),
                "Cierre de Caja - " + fecha,
                "Resumen del día " + fecha + ":\n\n" +
                "Atenciones realizadas: " + cantidadAtenciones + "\n\n" +
                "Efectivo:  S/ " + totalEfectivo + "\n" +
                "Yape:      S/ " + totalYape + "\n" +
                "Plin:      S/ " + totalPlin + "\n" +
                "TOTAL:     S/ " + totalGeneral
            );
        } catch (Exception e) {
            System.err.println("Error enviando resumen de cierre: " + e.getMessage());
        }
    }

    public void enviarAlertaStockBajo(List<String> nombresInsumos) {
        if (nombresInsumos == null || nombresInsumos.isEmpty()) return;
        try {
            StringBuilder msg = new StringBuilder("Los siguientes insumos están por debajo del stock mínimo:\n\n");
            for (String nombre : nombresInsumos) {
                msg.append("- ").append(nombre).append("\n");
            }
            msg.append("\nPor favor, realizar la reposición correspondiente.");
            enviar(correoAdmin(), "Alerta: Insumos con stock bajo", msg.toString());
        } catch (Exception e) {
            System.err.println("Error enviando alerta de stock: " + e.getMessage());
        }
    }

    @Value("${admin.email}")
    private String adminEmail;

    private String correoAdmin() { return adminEmail; }
}

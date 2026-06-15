package integrador.backend.service;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.SimpleEmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class EmailService {

    @Value("${mail.remitente}")
    private String correoRemitente;

    @Value("${mail.password}")
    private String passwordRemitente;

    @Value("${admin.email}")
    private String correoAdmin;

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        try {
            SimpleEmail email = buildEmail();
            email.addTo(correoDestino);
            email.setSubject("Código de Recuperación de Contraseña");
            email.setMsg("Hola,\n\nTu código de seguridad de 6 dígitos es: " + codigo +
                         "\n\nTienes 15 minutos para usarlo. Si no lo solicitaste, ignora este mensaje.");
            email.send();
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo: " + e.getMessage());
        }
    }

    public void enviarResumenCierreCaja(LocalDate fecha, BigDecimal totalEfectivo,
            BigDecimal totalYape, BigDecimal totalPlin, BigDecimal totalGeneral, int cantidadAtenciones) {
        try {
            SimpleEmail email = buildEmail();
            email.addTo(correoAdmin);
            email.setSubject("Cierre de Caja - " + fecha);
            email.setMsg(
                "Resumen del día " + fecha + ":\n\n" +
                "Atenciones realizadas: " + cantidadAtenciones + "\n\n" +
                "Efectivo:  S/ " + totalEfectivo + "\n" +
                "Yape:      S/ " + totalYape + "\n" +
                "Plin:      S/ " + totalPlin + "\n" +
                "──────────────────\n" +
                "TOTAL:     S/ " + totalGeneral
            );
            email.send();
        } catch (Exception e) {
            System.err.println("Error enviando resumen de cierre: " + e.getMessage());
        }
    }

    public void enviarAlertaStockBajo(List<String> nombresInsumos) {
        if (nombresInsumos == null || nombresInsumos.isEmpty()) return;
        try {
            SimpleEmail email = buildEmail();
            email.addTo(correoAdmin);
            email.setSubject("Alerta: Insumos con stock bajo");
            StringBuilder msg = new StringBuilder("Los siguientes insumos están por debajo del stock mínimo:\n\n");
            for (String nombre : nombresInsumos) {
                msg.append("- ").append(nombre).append("\n");
            }
            msg.append("\nPor favor, realizar la reposición correspondiente.");
            email.setMsg(msg.toString());
            email.send();
        } catch (Exception e) {
            System.err.println("Error enviando alerta de stock: " + e.getMessage());
        }
    }

    private SimpleEmail buildEmail() throws Exception {
        SimpleEmail email = new SimpleEmail();
        email.setHostName("smtp.gmail.com");
        email.setSmtpPort(587);
        email.setAuthenticator(new DefaultAuthenticator(correoRemitente, passwordRemitente));
        email.setStartTLSEnabled(true);
        email.setFrom(correoRemitente, "Sistema Barbería");
        return email;
    }
}

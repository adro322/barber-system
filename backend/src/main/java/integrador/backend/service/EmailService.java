package integrador.backend.service;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.SimpleEmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${mail.remitente}")
    private String correoRemitente;

    @Value("${mail.password}")
    private String passwordRemitente;

    public void enviarCodigoRecuperacion(String correoDestino, String codigo) {
        try {
            SimpleEmail email = new SimpleEmail();
            email.setHostName("smtp.gmail.com");
            email.setSmtpPort(587);
            
            email.setAuthenticator(new DefaultAuthenticator(correoRemitente, passwordRemitente));
            email.setStartTLSEnabled(true);
            
            email.setFrom(correoRemitente, "Sistema Barbería");
            email.addTo(correoDestino);
            
            email.setSubject("Código de Recuperación de Contraseña");
            email.setMsg("Hola,\n\nTu código de seguridad de 6 dígitos es: " + codigo + 
                         "\n\nIngrésalo en la página web para crear tu nueva contraseña.");
            
            email.send();
            
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo con Apache Commons: " + e.getMessage());
        }
    }
}
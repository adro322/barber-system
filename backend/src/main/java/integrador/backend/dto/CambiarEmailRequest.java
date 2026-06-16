package integrador.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CambiarEmailRequest {
    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    @NotBlank(message = "El nuevo correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String nuevoEmail;

    public String getContrasenaActual() { return contrasenaActual; }
    public void setContrasenaActual(String c) { this.contrasenaActual = c; }
    public String getNuevoEmail() { return nuevoEmail; }
    public void setNuevoEmail(String e) { this.nuevoEmail = e; }
}

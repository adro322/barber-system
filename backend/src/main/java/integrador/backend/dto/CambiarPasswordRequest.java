package integrador.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CambiarPasswordRequest {
    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String nuevaContrasena;

    public String getContrasenaActual() { return contrasenaActual; }
    public void setContrasenaActual(String c) { this.contrasenaActual = c; }
    public String getNuevaContrasena() { return nuevaContrasena; }
    public void setNuevaContrasena(String n) { this.nuevaContrasena = n; }
}

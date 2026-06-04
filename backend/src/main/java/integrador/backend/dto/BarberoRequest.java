package integrador.backend.dto;

import lombok.Data;

@Data
public class BarberoRequest {
    private String nombre;
    private String telefono;
    private String email;
    private String contrasena;
}

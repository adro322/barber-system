package integrador.backend.dto;

public class LoginResponse {
    private String token;
    private String rol;

    public LoginResponse(String token, String rol) {
        this.token = token;
        this.rol = rol;
    }

    // Genera Getters y Setters
    public String getToken() { return token; }
    public String getRol() { return rol; }
}
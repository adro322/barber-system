package integrador.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String contrasena;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @Column(name = "codigo_recuperacion")
    private String codigoRecuperacion;

    @JsonIgnore
    @Column(name = "codigo_expiracion")
    private LocalDateTime codigoExpiracion;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Usuario() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Rol getRol() { return rol;  }
    public void setRol(Rol rol) { this.rol = rol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCodigoRecuperacion() { return codigoRecuperacion; }
    public void setCodigoRecuperacion(String codigoRecuperacion) { this.codigoRecuperacion = codigoRecuperacion; }

    public LocalDateTime getCodigoExpiracion() { return codigoExpiracion; }
    public void setCodigoExpiracion(LocalDateTime codigoExpiracion) { this.codigoExpiracion = codigoExpiracion; }

}

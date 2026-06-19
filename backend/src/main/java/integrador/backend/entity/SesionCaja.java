package integrador.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sesion_caja", indexes = {
    @Index(name = "idx_sesion_caja_fecha", columnList = "fecha")
})
public class SesionCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalDateTime apertura;

    @Column(nullable = false)
    private String estado; // "ABIERTA" o "CERRADA"

    public SesionCaja() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalDateTime getApertura() { return apertura; }
    public void setApertura(LocalDateTime apertura) { this.apertura = apertura; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

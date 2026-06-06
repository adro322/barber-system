package integrador.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "total_efectivo", precision = 10, scale = 2)
    private BigDecimal totalEfectivo = BigDecimal.ZERO;

    @Column(name = "total_yape", precision = 10, scale = 2)
    private BigDecimal totalYape = BigDecimal.ZERO;

    @Column(name = "total_plin", precision = 10, scale = 2)
    private BigDecimal totalPlin = BigDecimal.ZERO;

    @Column(name = "total_general", precision = 10, scale = 2)
    private BigDecimal totalGeneral = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Reporte() {
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotalEfectivo() {
        return totalEfectivo;
    }
    public void setTotalEfectivo(BigDecimal totalEfectivo) {
        this.totalEfectivo = totalEfectivo;
    }

    public BigDecimal getTotalYape() {
        return totalYape;
    }
    public void setTotalYape(BigDecimal totalYape) {
        this.totalYape = totalYape;
    }

    public BigDecimal getTotalPlin() {
        return totalPlin;
    }
    public void setTotalPlin(BigDecimal totalPlin) {
        this.totalPlin = totalPlin;
    }

    public BigDecimal getTotalGeneral() {
        return totalGeneral;
    }
    public void setTotalGeneral(BigDecimal totalGeneral) {
        this.totalGeneral = totalGeneral;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}

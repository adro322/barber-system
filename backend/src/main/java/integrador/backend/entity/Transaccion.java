package integrador.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacciones", indexes = {
    @Index(name = "idx_transacciones_fecha", columnList = "fecha")
})
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_barbero", nullable = true)
    private Barbero barbero;

    @OneToOne
    @JoinColumn(name = "id_turno", nullable = false)
    private Turno turno;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "tipo_pago", nullable = false, length = 10)
    private String tipoPago;

    // Solo presentes cuando tipoPago = "MIXTO"
    @Column(name = "monto_efectivo", precision = 10, scale = 2)
    private BigDecimal montoEfectivo;

    @Column(name = "monto_yape", precision = 10, scale = 2)
    private BigDecimal montoYape;

    @Column(name = "monto_plin", precision = 10, scale = 2)
    private BigDecimal montoPlin;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void onCreate() { this.fecha = LocalDateTime.now(); }

    public Transaccion() {
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Barbero getBarbero() {
        return barbero;
    }
    public void setBarbero(Barbero barbero) {
        this.barbero = barbero;
    }

    public Turno getTurno() {
        return turno;
    }
    public void setTurno(Turno turno) {
        this.turno = turno;
    }

    public BigDecimal getMonto() {
        return monto;
    }
    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getTipoPago() {
        return tipoPago;
    }
    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getMontoEfectivo() { return montoEfectivo; }
    public void setMontoEfectivo(BigDecimal montoEfectivo) { this.montoEfectivo = montoEfectivo; }

    public BigDecimal getMontoYape() { return montoYape; }
    public void setMontoYape(BigDecimal montoYape) { this.montoYape = montoYape; }

    public BigDecimal getMontoPlin() { return montoPlin; }
    public void setMontoPlin(BigDecimal montoPlin) { this.montoPlin = montoPlin; }

}

package integrador.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Builder.Default
    @Column(name = "total_efectivo", precision = 10, scale = 2)
    private BigDecimal totalEfectivo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_yape", precision = 10, scale = 2)
    private BigDecimal totalYape = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_plin", precision = 10, scale = 2)
    private BigDecimal totalPlin = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_general", precision = 10, scale = 2)
    private BigDecimal totalGeneral = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

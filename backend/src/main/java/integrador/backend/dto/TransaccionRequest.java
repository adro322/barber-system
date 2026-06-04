package integrador.backend.dto;

import integrador.backend.enums.TipoPago;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransaccionRequest {
    private Long barberoId;
    private Long turnoId;
    private BigDecimal monto;
    private TipoPago tipoPago;
}

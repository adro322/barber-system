package integrador.backend.dto;

import lombok.Data;

@Data
public class TurnoRequest {
    private String nombreCliente;
    private Long barberoId;
    private Long servicioId;
}

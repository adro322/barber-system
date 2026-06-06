package integrador.backend.dto;

import lombok.Data;

@Data
public class InsumoRequest {
    private String nombre;
    private Integer stock;
    private Integer stockMinimo;
    private String unidad;
}

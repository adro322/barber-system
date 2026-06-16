package integrador.backend.dto;

import java.math.BigDecimal;

public class CobrarSplitRequest {
    private Long idTurno;
    private BigDecimal efectivo;
    private BigDecimal yape;
    private BigDecimal plin;

    public Long getIdTurno() { return idTurno; }
    public void setIdTurno(Long idTurno) { this.idTurno = idTurno; }

    public BigDecimal getEfectivo() { return efectivo; }
    public void setEfectivo(BigDecimal efectivo) { this.efectivo = efectivo; }

    public BigDecimal getYape() { return yape; }
    public void setYape(BigDecimal yape) { this.yape = yape; }

    public BigDecimal getPlin() { return plin; }
    public void setPlin(BigDecimal plin) { this.plin = plin; }
}

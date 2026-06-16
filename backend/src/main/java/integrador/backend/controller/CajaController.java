package integrador.backend.controller;

import integrador.backend.dto.CobrarSplitRequest;
import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.repository.ReporteRepository;
import integrador.backend.service.ReporteService;
import integrador.backend.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/caja")
public class CajaController {

    @Autowired
    private TransaccionService transaccionService;

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private ReporteRepository reporteRepository;

    @PostMapping("/cobrar-split")
    public ResponseEntity<Transaccion> registrarPagoSplit(@RequestBody CobrarSplitRequest req) {
        return ResponseEntity.ok(transaccionService.cobrarTurnoSplit(
                req.getIdTurno(), req.getEfectivo(), req.getYape(), req.getPlin()));
    }

    @PostMapping("/cierre")
    public ResponseEntity<Reporte> cerrarCajaDelDia() {
        return ResponseEntity.ok(reporteService.generarCierreDeCaja());
    }

    // Lista transacciones del dia o de un rango de fechas (desde=2026-06-01&hasta=2026-06-13)
    @GetMapping("/transacciones")
    public ResponseEntity<List<Transaccion>> listarTransacciones(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) {
        return ResponseEntity.ok(transaccionService.listarPorPeriodo(desde, hasta));
    }

    // Lista todos los cierres de caja guardados, ordenados del más reciente al más antiguo
    @GetMapping("/reportes")
    public ResponseEntity<List<Reporte>> listarReportes() {
        return ResponseEntity.ok(reporteRepository.findAllByOrderByFechaDesc());
    }

    // Descarga Excel del día (sin params) o de un rango de fechas (desde + hasta para reporte semanal)
    @GetMapping("/reporte/excel")
    public ResponseEntity<byte[]> descargarReporteExcel(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) throws Exception {

        LocalDate fechaDesde = desde != null ? LocalDate.parse(desde) : LocalDate.now();
        LocalDate fechaHasta = hasta != null ? LocalDate.parse(hasta) : LocalDate.now();

        List<Transaccion> transacciones = transaccionService.listarPorPeriodo(
                fechaDesde.toString(), fechaHasta.toString());

        double totalEfectivo = 0, totalYape = 0, totalPlin = 0, totalGeneral = 0;
        for (Transaccion t : transacciones) {
            double m = t.getMonto().doubleValue();
            totalGeneral += m;
            if ("MIXTO".equals(t.getTipoPago())) {
                if (t.getMontoEfectivo() != null) totalEfectivo += t.getMontoEfectivo().doubleValue();
                if (t.getMontoYape()     != null) totalYape     += t.getMontoYape().doubleValue();
                if (t.getMontoPlin()     != null) totalPlin     += t.getMontoPlin().doubleValue();
            } else {
                switch (t.getTipoPago()) {
                    case "EFECTIVO" -> totalEfectivo += m;
                    case "YAPE"     -> totalYape += m;
                    case "PLIN"     -> totalPlin += m;
                }
            }
        }

        boolean esRango = desde != null;
        String titulo = esRango ? "Reporte Semanal" : "Cierre de Caja";
        String nombreArchivo = esRango
                ? "Reporte_Semanal_" + fechaDesde + "_al_" + fechaHasta + ".xlsx"
                : "Cierre_Caja_" + fechaDesde + ".xlsx";

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(titulo);

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Fecha");
        headerRow.createCell(1).setCellValue("Cliente");
        headerRow.createCell(2).setCellValue("Barbero");
        headerRow.createCell(3).setCellValue("Servicio");
        headerRow.createCell(4).setCellValue("Tipo Pago");
        headerRow.createCell(5).setCellValue("Monto (S/.)");

        int rowIdx = 1;
        for (Transaccion t : transacciones) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(t.getFecha().toString());
            row.createCell(1).setCellValue(t.getTurno() != null ? t.getTurno().getNombreCliente() : "-");
            row.createCell(2).setCellValue(t.getBarbero() != null ? t.getBarbero().getNombre() : "-");
            row.createCell(3).setCellValue(t.getTurno() != null && t.getTurno().getServicio() != null ? t.getTurno().getServicio().getNombre() : "-");
            String tipoPagoLabel = t.getTipoPago();
            if ("MIXTO".equals(tipoPagoLabel)) {
                StringBuilder sb = new StringBuilder("MIXTO (");
                if (t.getMontoEfectivo() != null) sb.append("Ef:").append(t.getMontoEfectivo().toPlainString()).append(" ");
                if (t.getMontoYape()     != null) sb.append("Yp:").append(t.getMontoYape().toPlainString()).append(" ");
                if (t.getMontoPlin()     != null) sb.append("Pl:").append(t.getMontoPlin().toPlainString());
                sb.append(")");
                tipoPagoLabel = sb.toString().trim();
            }
            row.createCell(4).setCellValue(tipoPagoLabel);
            row.createCell(5).setCellValue(t.getMonto().doubleValue());
        }

        Row totalRow = sheet.createRow(rowIdx + 1);
        totalRow.createCell(0).setCellValue("TOTALES");
        totalRow.createCell(1).setCellValue("Efectivo: S/. " + String.format("%.2f", totalEfectivo));
        totalRow.createCell(2).setCellValue("Yape: S/. " + String.format("%.2f", totalYape));
        totalRow.createCell(3).setCellValue("Plin: S/. " + String.format("%.2f", totalPlin));
        totalRow.createCell(5).setCellValue(totalGeneral);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", nombreArchivo);

        return ResponseEntity.ok().headers(headers).body(outputStream.toByteArray());
    }
}

package integrador.backend.controller;

import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
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
import java.util.List;

@RestController
@RequestMapping("/api/caja")
public class CajaController {

    @Autowired
    private TransaccionService transaccionService;

    @Autowired
    private ReporteService reporteService;

    @PostMapping("/cobrar")
    public ResponseEntity<Transaccion> registrarPago(
            @RequestParam Long idTurno,
            @RequestParam String tipoPago) {
        return ResponseEntity.ok(transaccionService.cobrarTurno(idTurno, tipoPago));
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

    // Descarga Excel con el resumen del dia SIN guardar nuevo reporte en BD
    @GetMapping("/reporte/excel")
    public ResponseEntity<byte[]> descargarReporteExcel() throws Exception {

        Reporte resumen = reporteService.calcularResumenDeHoy();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Cierre de Caja");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Fecha");
        headerRow.createCell(1).setCellValue("Efectivo");
        headerRow.createCell(2).setCellValue("Yape");
        headerRow.createCell(3).setCellValue("Plin");
        headerRow.createCell(4).setCellValue("TOTAL FINAL");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue(resumen.getFecha().toString());
        dataRow.createCell(1).setCellValue(resumen.getTotalEfectivo().doubleValue());
        dataRow.createCell(2).setCellValue(resumen.getTotalYape().doubleValue());
        dataRow.createCell(3).setCellValue(resumen.getTotalPlin().doubleValue());
        dataRow.createCell(4).setCellValue(resumen.getTotalGeneral().doubleValue());

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Cierre_Caja_" + resumen.getFecha() + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(outputStream.toByteArray());
    }
}

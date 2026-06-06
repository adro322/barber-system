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

    // React enviará: POST /api/caja/cobrar?idTurno=1&tipoPago=YAPE
    @PostMapping("/cobrar")
    public ResponseEntity<Transaccion> registrarPago(
            @RequestParam Long idTurno,
            @RequestParam String tipoPago) {
        return ResponseEntity.ok(transaccionService.cobrarTurno(idTurno, tipoPago));
    }

    // React enviará: POST /api/caja/cierre
    @PostMapping("/cierre")
    public ResponseEntity<Reporte> cerrarCajaDelDia() {
        return ResponseEntity.ok(reporteService.generarCierreDeCaja());
    }

    @GetMapping("/reporte/excel")
    public ResponseEntity<byte[]> descargarReporteExcel() throws Exception {
       
        Reporte reporteDeHoy = reporteService.generarCierreDeCaja();

        // 1. Crear el libro y la hoja de Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Cierre de Caja");

        // 2. Crear las cabeceras
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Fecha");
        headerRow.createCell(1).setCellValue("Efectivo");
        headerRow.createCell(2).setCellValue("Yape");
        headerRow.createCell(3).setCellValue("Plin");
        headerRow.createCell(4).setCellValue("TOTAL FINAL");

        // 3. Llenar los datos
        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue(reporteDeHoy.getFecha().toString());
        dataRow.createCell(1).setCellValue(reporteDeHoy.getTotalEfectivo().doubleValue());
        dataRow.createCell(2).setCellValue(reporteDeHoy.getTotalYape().doubleValue());
        dataRow.createCell(3).setCellValue(reporteDeHoy.getTotalPlin().doubleValue());
        dataRow.createCell(4).setCellValue(reporteDeHoy.getTotalGeneral().doubleValue());

        // 4. Convertirlo a bytes para enviarlo por internet
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        // 5. Preparar la respuesta para que el navegador lo detecte como descarga
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Cierre_Caja.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(outputStream.toByteArray());
    }
}
package integrador.backend.controller;

import integrador.backend.dto.CobrarSplitRequest;
import integrador.backend.entity.Reporte;
import integrador.backend.entity.Transaccion;
import integrador.backend.repository.ReporteRepository;
import integrador.backend.service.EventoBroadcaster;
import integrador.backend.service.ReporteService;
import integrador.backend.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/caja")
public class CajaController {

    @Autowired private TransaccionService transaccionService;
    @Autowired private ReporteService reporteService;
    @Autowired private ReporteRepository reporteRepository;
    @Autowired private EventoBroadcaster broadcaster;

    @PostMapping("/cobrar-split")
    public ResponseEntity<Transaccion> registrarPagoSplit(@RequestBody CobrarSplitRequest req) {
        Transaccion t = transaccionService.cobrarTurnoSplit(
                req.getIdTurno(), req.getEfectivo(), req.getYape(), req.getPlin());
        broadcaster.broadcast();
        return ResponseEntity.ok(t);
    }

    @PostMapping("/cierre")
    public ResponseEntity<Reporte> cerrarCajaDelDia() {
        return ResponseEntity.ok(reporteService.generarCierreDeCaja());
    }

    @GetMapping("/transacciones")
    public ResponseEntity<List<Transaccion>> listarTransacciones(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) {
        return ResponseEntity.ok(transaccionService.listarPorPeriodo(desde, hasta));
    }

    @GetMapping("/reportes")
    public ResponseEntity<List<Reporte>> listarReportes() {
        return ResponseEntity.ok(reporteRepository.findAllByOrderByFechaDesc());
    }

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
        String periodo = esRango ? fechaDesde + " al " + fechaHasta : fechaDesde.toString();
        String nombreArchivo = esRango
                ? "Reporte_Semanal_" + fechaDesde + "_al_" + fechaHasta + ".xlsx"
                : "Cierre_Caja_" + fechaDesde + ".xlsx";

        // ─── Workbook ───────────────────────────────────────────────────────
        XSSFWorkbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet(titulo);

        // ─── Paleta ──────────────────────────────────────────────────────────
        XSSFColor gold     = new XSSFColor(new byte[]{(byte)201,(byte)168,(byte)76}, null);
        XSSFColor darkGold = new XSSFColor(new byte[]{(byte)160,(byte)130,(byte)50}, null);
        XSSFColor rowAlt   = new XSSFColor(new byte[]{(byte)245,(byte)245,(byte)245}, null);
        XSSFColor totalBg  = new XSSFColor(new byte[]{(byte)240,(byte)225,(byte)160}, null);

        // ─── Fuentes ─────────────────────────────────────────────────────────
        XSSFFont fTitle = (XSSFFont) wb.createFont();
        fTitle.setFontName("Calibri"); fTitle.setFontHeightInPoints((short)15); fTitle.setBold(true);

        XSSFFont fSub = (XSSFFont) wb.createFont();
        fSub.setFontName("Calibri"); fSub.setFontHeightInPoints((short)10); fSub.setItalic(true);

        XSSFFont fHeader = (XSSFFont) wb.createFont();
        fHeader.setFontName("Calibri"); fHeader.setFontHeightInPoints((short)11); fHeader.setBold(true);

        XSSFFont fData = (XSSFFont) wb.createFont();
        fData.setFontName("Calibri"); fData.setFontHeightInPoints((short)10);

        XSSFFont fTotal = (XSSFFont) wb.createFont();
        fTotal.setFontName("Calibri"); fTotal.setFontHeightInPoints((short)11); fTotal.setBold(true);

        // ─── Formato numérico ─────────────────────────────────────────────────
        DataFormat fmt = wb.createDataFormat();
        short numFmt = fmt.getFormat("#,##0.00");

        // ─── Estilos ──────────────────────────────────────────────────────────
        // Título (fila 0)
        XSSFCellStyle sTitle = (XSSFCellStyle) wb.createCellStyle();
        sTitle.setFillForegroundColor(gold); sTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sTitle.setFont(fTitle); sTitle.setAlignment(HorizontalAlignment.CENTER);
        sTitle.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorders(sTitle, BorderStyle.MEDIUM);

        // Subtítulo (fila 1)
        XSSFCellStyle sSub = (XSSFCellStyle) wb.createCellStyle();
        sTitle.setFillForegroundColor(gold); sTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sSub.setFont(fSub); sSub.setAlignment(HorizontalAlignment.CENTER);
        applyBorders(sSub, BorderStyle.THIN);

        // Encabezados de columna (fila 2)
        XSSFCellStyle sHeader = (XSSFCellStyle) wb.createCellStyle();
        sHeader.setFillForegroundColor(darkGold); sHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sHeader.setFont(fHeader); sHeader.setAlignment(HorizontalAlignment.CENTER);
        applyBorders(sHeader, BorderStyle.THIN);

        // Datos normal (texto)
        XSSFCellStyle sData = (XSSFCellStyle) wb.createCellStyle();
        sData.setFont(fData); applyBorders(sData, BorderStyle.THIN);
        // Datos normal (número)
        XSSFCellStyle sDataNum = (XSSFCellStyle) wb.createCellStyle();
        sDataNum.setFont(fData); sDataNum.setDataFormat(numFmt);
        sDataNum.setAlignment(HorizontalAlignment.RIGHT); applyBorders(sDataNum, BorderStyle.THIN);

        // Datos alternado (texto)
        XSSFCellStyle sAlt = (XSSFCellStyle) wb.createCellStyle();
        sAlt.setFillForegroundColor(rowAlt); sAlt.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sAlt.setFont(fData); applyBorders(sAlt, BorderStyle.THIN);
        // Datos alternado (número)
        XSSFCellStyle sAltNum = (XSSFCellStyle) wb.createCellStyle();
        sAltNum.setFillForegroundColor(rowAlt); sAltNum.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sAltNum.setFont(fData); sAltNum.setDataFormat(numFmt);
        sAltNum.setAlignment(HorizontalAlignment.RIGHT); applyBorders(sAltNum, BorderStyle.THIN);

        // Totales (texto)
        XSSFCellStyle sTotal = (XSSFCellStyle) wb.createCellStyle();
        sTotal.setFillForegroundColor(totalBg); sTotal.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sTotal.setFont(fTotal); applyBorders(sTotal, BorderStyle.MEDIUM);
        // Totales (número)
        XSSFCellStyle sTotalNum = (XSSFCellStyle) wb.createCellStyle();
        sTotalNum.setFillForegroundColor(totalBg); sTotalNum.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sTotalNum.setFont(fTotal); sTotalNum.setDataFormat(numFmt);
        sTotalNum.setAlignment(HorizontalAlignment.RIGHT); applyBorders(sTotalNum, BorderStyle.MEDIUM);

        // ─── Fila 0: Título principal ─────────────────────────────────────────
        Row titleRow = sheet.createRow(0);
        titleRow.setHeightInPoints(32);
        for (int c = 0; c <= 5; c++) titleRow.createCell(c).setCellStyle(sTitle);
        titleRow.getCell(0).setCellValue("BARBER VES — " + titulo);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

        // ─── Fila 1: Período ──────────────────────────────────────────────────
        Row subRow = sheet.createRow(1);
        subRow.setHeightInPoints(18);
        for (int c = 0; c <= 5; c++) subRow.createCell(c).setCellStyle(sSub);
        subRow.getCell(0).setCellValue("Período: " + periodo);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

        // ─── Fila 2: Encabezados de columna ───────────────────────────────────
        String[] headers = {"Fecha", "Cliente", "Barbero", "Servicio", "Tipo Pago", "Monto (S/.)"};
        Row headerRow = sheet.createRow(2);
        headerRow.setHeightInPoints(20);
        for (int c = 0; c < headers.length; c++) {
            Cell cell = headerRow.createCell(c);
            cell.setCellValue(headers[c]);
            cell.setCellStyle(sHeader);
        }

        // ─── Filas de datos ───────────────────────────────────────────────────
        int rowIdx = 3;
        for (int i = 0; i < transacciones.size(); i++) {
            Transaccion t = transacciones.get(i);
            Row row = sheet.createRow(rowIdx++);
            boolean alt = (i % 2 == 1);
            CellStyle cs    = alt ? sAlt    : sData;
            CellStyle csNum = alt ? sAltNum : sDataNum;

            Cell cFecha = row.createCell(0);
            cFecha.setCellValue(t.getFecha() != null ? t.getFecha().toLocalDate().toString() : "-");
            cFecha.setCellStyle(cs);

            Cell cCliente = row.createCell(1);
            cCliente.setCellValue(t.getTurno() != null ? t.getTurno().getNombreCliente() : "-");
            cCliente.setCellStyle(cs);

            Cell cBarbero = row.createCell(2);
            cBarbero.setCellValue(t.getBarbero() != null ? t.getBarbero().getNombre() : "-");
            cBarbero.setCellStyle(cs);

            Cell cServicio = row.createCell(3);
            cServicio.setCellValue(t.getTurno() != null && t.getTurno().getServicio() != null
                    ? t.getTurno().getServicio().getNombre() : "-");
            cServicio.setCellStyle(cs);

            String tipoPagoLabel = t.getTipoPago();
            if ("MIXTO".equals(tipoPagoLabel)) {
                StringBuilder sb = new StringBuilder("MIXTO (");
                if (t.getMontoEfectivo() != null) sb.append("Ef:").append(t.getMontoEfectivo().toPlainString()).append(" ");
                if (t.getMontoYape()     != null) sb.append("Yp:").append(t.getMontoYape().toPlainString()).append(" ");
                if (t.getMontoPlin()     != null) sb.append("Pl:").append(t.getMontoPlin().toPlainString());
                sb.append(")");
                tipoPagoLabel = sb.toString().trim();
            }
            Cell cTipo = row.createCell(4);
            cTipo.setCellValue(tipoPagoLabel);
            cTipo.setCellStyle(cs);

            Cell cMonto = row.createCell(5);
            cMonto.setCellValue(t.getMonto().doubleValue());
            cMonto.setCellStyle(csNum);
        }

        // ─── Fila de totales ──────────────────────────────────────────────────
        Row totalRow = sheet.createRow(rowIdx + 1);
        totalRow.setHeightInPoints(22);
        for (int c = 0; c <= 5; c++) totalRow.createCell(c).setCellStyle(c == 5 ? sTotalNum : sTotal);
        totalRow.getCell(0).setCellValue("TOTALES");
        totalRow.getCell(1).setCellValue("Efectivo: S/. " + String.format("%.2f", totalEfectivo));
        totalRow.getCell(2).setCellValue("Yape: S/. " + String.format("%.2f", totalYape));
        totalRow.getCell(3).setCellValue("Plin: S/. " + String.format("%.2f", totalPlin));
        totalRow.getCell(5).setCellValue(totalGeneral);

        // ─── Anchos de columna ────────────────────────────────────────────────
        sheet.setColumnWidth(0, 22 * 256);
        sheet.setColumnWidth(1, 26 * 256);
        sheet.setColumnWidth(2, 22 * 256);
        sheet.setColumnWidth(3, 24 * 256);
        sheet.setColumnWidth(4, 32 * 256);
        sheet.setColumnWidth(5, 16 * 256);

        // ─── Serializar ───────────────────────────────────────────────────────
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        wb.write(outputStream);
        wb.close();

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        httpHeaders.setContentDispositionFormData("attachment", nombreArchivo);

        return ResponseEntity.ok().headers(httpHeaders).body(outputStream.toByteArray());
    }

    private static void applyBorders(CellStyle style, BorderStyle border) {
        style.setBorderTop(border);
        style.setBorderBottom(border);
        style.setBorderLeft(border);
        style.setBorderRight(border);
    }
}

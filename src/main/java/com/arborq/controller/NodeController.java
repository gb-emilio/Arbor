package com.arborq.controller;

import com.arborq.dto.*;
import com.arborq.model.PdfFile;
import com.arborq.service.NodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST API — Árbol de preguntas jerárquicas ArborQ
 *
 * Base URL: /api/v1
 *
 * Recursos de LECTURA — cualquier usuario autenticado (USER o ADMIN):
 *   GET    /nodes                         → árbol completo
 *   GET    /nodes/roots                   → solo nodos raíz
 *   GET    /nodes/{id}                    → nodo + hijos
 *   GET    /nodes/{id}/children           → hijos directos
 *   GET    /nodes/{id}/pdf                → descargar PDF (público, ver SecurityConfig)
 *
 * Recursos de ESCRITURA — solo ADMIN:
 *   POST   /nodes                         → crear nodo
 *   PUT    /nodes/{id}                    → actualizar nodo
 *   PATCH  /nodes/{id}/reorder-children   → reordenar hijos
 *   DELETE /nodes/{id}                    → eliminar nodo (cascade)
 *   POST   /nodes/{id}/pdf                → subir PDF (multipart)
 *   DELETE /nodes/{id}/pdf                → eliminar PDF
 */
@RestController
@RequestMapping("/api/v1/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    // ── GET árbol completo ────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<NodeResponse>> getFullTree() {
        return ResponseEntity.ok(nodeService.getFullTree());
    }

    // ── GET raíces ────────────────────────────────────────────────────────────

    @GetMapping("/roots")
    public ResponseEntity<List<NodeResponse>> getRoots() {
        return ResponseEntity.ok(nodeService.getRoots());
    }

    // ── GET nodo por ID ───────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<NodeResponse> getNode(@PathVariable UUID id) {
        return ResponseEntity.ok(nodeService.getNode(id));
    }

    // ── GET hijos ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/children")
    public ResponseEntity<List<NodeResponse>> getChildren(@PathVariable UUID id) {
        return ResponseEntity.ok(nodeService.getChildren(id));
    }

    // ── POST crear nodo — solo ADMIN ────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<NodeResponse> createNode(@Valid @RequestBody NodeRequest req) {
        NodeResponse created = nodeService.createNode(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── PUT actualizar nodo — solo ADMIN ────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<NodeResponse> updateNode(
            @PathVariable UUID id,
            @Valid @RequestBody NodeRequest req) {
        return ResponseEntity.ok(nodeService.updateNode(id, req));
    }

    // ── PATCH reordenar hijos — solo ADMIN ──────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/reorder-children")
    public ResponseEntity<List<NodeResponse>> reorderChildren(
            @PathVariable UUID id,
            @RequestBody ReorderRequest req) {
        return ResponseEntity.ok(nodeService.reorderChildren(id, req));
    }

    // ── DELETE nodo — solo ADMIN ─────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable UUID id) {
        nodeService.deleteNode(id);
        return ResponseEntity.noContent().build();
    }

    // ── PDF: SUBIR — solo ADMIN ──────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/{id}/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PdfMetaResponse> uploadPdf(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) throws IOException {
        PdfMetaResponse meta = nodeService.uploadPdf(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(meta);
    }

    // ── PDF: DESCARGAR — público (ver SecurityConfig, permitAll para GET) ───────

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        PdfFile pdf = nodeService.downloadPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + pdf.getFilename() + "\"")
                .contentLength(pdf.getFileSize() != null ? pdf.getFileSize() : pdf.getData().length)
                .body(pdf.getData());
    }

    // ── PDF: ELIMINAR — solo ADMIN ───────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/pdf")
    public ResponseEntity<Void> deletePdf(@PathVariable UUID id) {
        nodeService.deletePdf(id);
        return ResponseEntity.noContent().build();
    }
}

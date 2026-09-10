package com.arborq.controller;

import com.arborq.dto.EmailTemplateRequest;
import com.arborq.dto.EmailTemplateResponse;
import com.arborq.service.EmailTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Plantilla de email única, compartida por todas las hojas del árbol.
 * Solo el administrador puede leerla/editarla desde el panel.
 */
@RestController
@RequestMapping("/api/v1/email-template")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmailTemplateController {

    private final EmailTemplateService service;

    @GetMapping
    public EmailTemplateResponse get() {
        return service.get();
    }

    @PutMapping
    public EmailTemplateResponse update(@Valid @RequestBody EmailTemplateRequest req) {
        return service.update(req);
    }
}

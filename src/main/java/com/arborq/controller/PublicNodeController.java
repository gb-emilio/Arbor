package com.arborq.controller;

import com.arborq.dto.NodeResponse;
import com.arborq.dto.SendSolutionRequest;
import com.arborq.security.RateLimitException;
import com.arborq.security.SolutionRequestRateLimiter;
import com.arborq.service.NodeService;
import com.arborq.service.SolutionRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Endpoints públicos — no requieren autenticación.
 * Expuestos bajo /api/v1/public para poder hacer permitAll()
 * sin tocar el resto de la seguridad.
 */
@RestController
@RequestMapping("/api/v1/public/nodes")
@RequiredArgsConstructor
public class PublicNodeController {

    private final NodeService nodeService;
    private final SolutionRequestService solutionRequestService;
    private final SolutionRequestRateLimiter rateLimiter;

    /** Todas las raíces del árbol (primer nivel) */
    @GetMapping("/roots")
    public List<NodeResponse> getRoots() {
        return nodeService.getRoots();
    }

    /** Un nodo concreto con sus hijos directos */
    @GetMapping("/{id}")
    public NodeResponse getNode(@PathVariable UUID id) {
        return nodeService.getNode(id);
    }

    /**
     * Envía la solución (documento + plantilla de email) de un nodo hoja
     * al email indicado por el solicitante, previa aceptación de las
     * políticas de privacidad y tratamiento de datos.
     */
    @PostMapping("/{id}/send-solution")
    public ResponseEntity<Map<String, String>> sendSolution(
            @PathVariable UUID id,
            @Valid @RequestBody SendSolutionRequest req,
            HttpServletRequest request) {

        String ip = clientIp(request);
        long waitSeconds = rateLimiter.secondsUntilAllowed(ip);
        if (waitSeconds > 0) {
            throw new RateLimitException(
                    "Demasiadas solicitudes. Espera " + waitSeconds + " segundos e inténtalo de nuevo.");
        }

        solutionRequestService.send(id, req, ip);
        return ResponseEntity.ok(Map.of("message", "Solución enviada correctamente a tu email."));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

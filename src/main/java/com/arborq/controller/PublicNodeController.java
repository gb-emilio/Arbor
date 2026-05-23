package com.arborq.controller;

import com.arborq.dto.NodeResponse;
import com.arborq.service.NodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Endpoints públicos de solo lectura — no requieren autenticación.
 * Usan el mismo NodeService que el panel de administración,
 * pero expuestos bajo /api/v1/public para poder hacer permitAll()
 * sin tocar el resto de la seguridad.
 */
@RestController
@RequestMapping("/api/v1/public/nodes")
@RequiredArgsConstructor
public class PublicNodeController {

    private final NodeService nodeService;

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
}

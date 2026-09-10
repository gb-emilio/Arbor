package com.arborq.service;

import com.arborq.dto.SendSolutionRequest;
import com.arborq.model.Node;
import com.arborq.model.PdfFile;
import com.arborq.model.SolutionRequestLog;
import com.arborq.repository.NodeRepository;
import com.arborq.repository.PdfFileRepository;
import com.arborq.repository.SolutionRequestLogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolutionRequestService {

    private final NodeRepository nodeRepo;
    private final PdfFileRepository pdfRepo;
    private final SolutionRequestLogRepository logRepo;
    private final MailService mailService;

    /**
     * Envía la solución del nodo indicado al email del solicitante y deja
     * constancia de la petición y del consentimiento aceptado (auditoría RGPD).
     */
    @Transactional
    public void send(UUID nodeId, SendSolutionRequest req, String ip) {
        Node node = nodeRepo.findById(nodeId)
                .orElseThrow(() -> new EntityNotFoundException("Nodo no encontrado: " + nodeId));

        if (!node.isLeaf()) {
            throw new IllegalArgumentException("Solo se puede enviar la solución de un nodo hoja.");
        }

        PdfFile pdf = pdfRepo.findByNodeId(nodeId).orElse(null);

        boolean sentOk = false;
        try {
            mailService.sendSolution(node.getText(), pdf, req);
            sentOk = true;
        } catch (Exception e) {
            log.error("Error enviando email de solución a {}", req.getEmail(), e);
        } finally {
            // Se registra la solicitud tanto si el envío tuvo éxito como si no,
            // para dejar constancia del consentimiento aceptado en todo caso.
            SolutionRequestLog entry = new SolutionRequestLog();
            entry.setNodeId(nodeId);
            entry.setNombre(req.getNombre().trim());
            entry.setApellidos(req.getApellidos().trim());
            entry.setNacionalidad(req.getNacionalidad().trim());
            entry.setTelefono(req.getTelefono().trim());
            entry.setEmail(req.getEmail().trim().toLowerCase());
            entry.setAceptaPrivacidad(req.isAceptaPrivacidad());
            entry.setAceptaTratamiento(req.isAceptaTratamiento());
            entry.setIpAddress(ip);
            entry.setSentOk(sentOk);
            logRepo.save(entry);
        }

        if (!sentOk) {
            throw new IllegalStateException(
                    "No se pudo enviar el email. Verifica la configuración del servidor de correo.");
        }
    }
}

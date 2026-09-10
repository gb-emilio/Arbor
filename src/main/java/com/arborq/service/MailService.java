package com.arborq.service;

import com.arborq.dto.SendSolutionRequest;
import com.arborq.model.EmailTemplate;
import com.arborq.model.PdfFile;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateService templateService;

    @Value("${app.mail.from}")
    private String fromAddress;

    /**
     * Renderiza la plantilla compartida con los datos del solicitante y del
     * documento, y envía el email con el PDF adjunto (si el nodo tiene uno).
     */
    public void sendSolution(String nodeTitle, PdfFile pdf, SendSolutionRequest req) throws MessagingException {
        EmailTemplate template = templateService.getOrCreate();

        String subject = render(template.getSubject(), nodeTitle, req);
        String body = render(template.getBody(), nodeTitle, req);

        MimeMessage message = mailSender.createMimeMessage();
        // multipart=true habilita adjuntar el PDF; useEncoding UTF-8 para acentos/ñ
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(req.getEmail());
        helper.setSubject(subject);
        helper.setText(body, true); // true = el body es HTML

        if (pdf != null && pdf.getData() != null) {
            helper.addAttachment(
                    pdf.getFilename() != null ? pdf.getFilename() : "documento.pdf",
                    new org.springframework.core.io.ByteArrayResource(pdf.getData()),
                    pdf.getContentType() != null ? pdf.getContentType() : "application/pdf"
            );
        }

        mailSender.send(message);
        log.info("Email de solución enviado a {} (nodo: {})", req.getEmail(), nodeTitle);
    }

    /** Sustituye los placeholders {{campo}} por los valores reales. */
    private String render(String template, String nodeTitle, SendSolutionRequest req) {
        // IMPORTANTE: se protege cada valor con safe() ANTES de concatenar.
        // Concatenar con + un valor null lo convierte en el texto literal "null"
        // (comportamiento de Java), y una vez es texto ya no hay forma de
        // distinguirlo de un valor real — hay que evitarlo en origen.
        String nombreSafe    = safe(req.getNombre());
        String apellidosSafe = safe(req.getApellidos());
        String nombreCompleto = (nombreSafe + " " + apellidosSafe).trim();

        return template
                .replace("{{nombre}}", nombreSafe)
                .replace("{{apellidos}}", apellidosSafe)
                .replace("{{nombre_completo}}", nombreCompleto)
                .replace("{{nacionalidad}}", safe(req.getNacionalidad()))
                .replace("{{telefono}}", safe(req.getTelefono()))
                .replace("{{email}}", safe(req.getEmail()))
                .replace("{{titulo_documento}}", safeTitle(nodeTitle));
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    /**
     * Igual que safe(), pero con un texto de respaldo legible en vez de
     * cadena vacía, ya que dejar el asunto del email en blanco ("Tu solución
     * de  — Bcorcino Abogados") queda peor que un texto genérico.
     */
    private String safeTitle(String s) {
        return (s == null || s.isBlank()) ? "tu consulta" : s;
    }
}

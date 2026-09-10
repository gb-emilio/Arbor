package com.arborq.service;

import com.arborq.dto.EmailTemplateRequest;
import com.arborq.dto.EmailTemplateResponse;
import com.arborq.model.EmailTemplate;
import com.arborq.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository repo;

    private static final String DEFAULT_SUBJECT = "Tu solución de {{titulo_documento}} — Bcorcino Abogados";
    private static final String DEFAULT_BODY = """
            <p>Hola {{nombre}},</p>
            <p>Gracias por completar la consulta gratuita. Adjuntamos el documento con la información correspondiente a tu caso: <strong>{{titulo_documento}}</strong>.</p>
            <p>Si tienes cualquier duda adicional o necesitas asesoramiento personalizado, no dudes en responder a este correo o contactarnos directamente.</p>
            <p>Un saludo,<br>Bcorcino Abogados</p>
            """;

    /** Siempre existe una única fila (id=1). La crea con un texto por defecto si no existe todavía. */
    @Transactional
    public EmailTemplate getOrCreate() {
        return repo.findById(1).orElseGet(() -> {
            EmailTemplate t = new EmailTemplate();
            t.setId(1);
            t.setSubject(DEFAULT_SUBJECT);
            t.setBody(DEFAULT_BODY);
            return repo.save(t);
        });
    }

    @Transactional(readOnly = true)
    public EmailTemplateResponse get() {
        EmailTemplate t = getOrCreate();
        return new EmailTemplateResponse(t.getSubject(), t.getBody(), t.getUpdatedAt());
    }

    @Transactional
    public EmailTemplateResponse update(EmailTemplateRequest req) {
        EmailTemplate t = getOrCreate();
        t.setSubject(req.getSubject().trim());
        t.setBody(req.getBody());
        EmailTemplate saved = repo.save(t);
        return new EmailTemplateResponse(saved.getSubject(), saved.getBody(), saved.getUpdatedAt());
    }
}

package com.arborq.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Plantilla de email única, compartida por todas las hojas del árbol.
 * Siempre existe una única fila con id=1 (ver EmailTemplateService).
 */
@Entity
@Table(name = "email_template")
@Getter
@Setter
public class EmailTemplate {

    @Id
    private Integer id = 1;

    @Column(nullable = false, length = 255)
    private String subject;

    /** Admite HTML simple y placeholders {{nombre}}, {{apellidos}}, etc. */
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String body;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

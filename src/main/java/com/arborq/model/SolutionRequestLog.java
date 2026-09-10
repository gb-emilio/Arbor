package com.arborq.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Registro de cada solicitud de envío de solución por email.
 * Sirve como constancia del consentimiento (privacidad + tratamiento de
 * datos) aceptado por el usuario, con fecha e IP, para poder acreditarlo
 * si fuera necesario (RGPD, art. 7.1 — el responsable debe poder demostrar
 * que el interesado consintió).
 */
@Entity
@Table(name = "solution_request_log")
@Getter
@Setter
public class SolutionRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Nodo hoja sobre el que se solicitó la solución (puede quedar null si el nodo se borra después) */
    @Column(name = "node_id")
    private UUID nodeId;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 150)
    private String apellidos;

    @Column(nullable = false, length = 100)
    private String nacionalidad;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "acepta_privacidad", nullable = false)
    private boolean aceptaPrivacidad;

    @Column(name = "acepta_tratamiento", nullable = false)
    private boolean aceptaTratamiento;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "sent_ok", nullable = false)
    private boolean sentOk;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}

-- ============================================================
--  ArborQ — Esquema MySQL 8 (solo estructura, sin datos)
--  Los datos de ejemplo están en 02_data.sql
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ------------------------------------------------------------
--  USUARIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BINARY(16)   NOT NULL,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    enabled       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'USER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  NODOS
--  service_link_*, paypal_button_id, calendly_url: recuadros de
--  servicios que se muestran en las hojas de la guía pública.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nodes (
    id                 BINARY(16)   NOT NULL,
    type               VARCHAR(10)  NOT NULL,
    text               TEXT         NOT NULL,
    description        TEXT,
    parent_id          BINARY(16)   NULL,
    position           INT          NOT NULL DEFAULT 0,
    service_link_url   VARCHAR(500) NULL COMMENT 'URL del enlace personalizado (recuadro 1)',
    service_link_label VARCHAR(200) NULL COMMENT 'Texto del botón del enlace personalizado',
    paypal_button_id   VARCHAR(200) NULL COMMENT 'Hosted Button ID de PayPal (recuadro 2)',
    calendly_url       VARCHAR(500) NULL COMMENT 'URL del widget de Calendly (recuadro 3)',
    created_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_nodes_parent FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT chk_nodes_type  CHECK (type IN ('question', 'leaf')),
    INDEX idx_nodes_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  OPCIONES DE RESPUESTA
--  target_node_id: nodo al que navega esta respuesta (puede ser null)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS options (
    id             BINARY(16)  NOT NULL,
    node_id        BINARY(16)  NOT NULL,
    label          TEXT        NOT NULL,
    position       INT         NOT NULL DEFAULT 0,
    target_node_id BINARY(16)  NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_options_node   FOREIGN KEY (node_id)        REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_options_target FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    INDEX idx_options_node (node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  ARCHIVOS PDF
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pdf_files (
    id           BINARY(16)   NOT NULL,
    node_id      BINARY(16)   NOT NULL,
    filename     VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_size    BIGINT,
    data         LONGBLOB     NOT NULL,
    uploaded_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_pdf_node (node_id),
    CONSTRAINT fk_pdf_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  PLANTILLA DE EMAIL — fila única, compartida por todas las hojas
--  Placeholders admitidos en subject/body:
--    {{nombre}} {{apellidos}} {{nombre_completo}} {{nacionalidad}}
--    {{telefono}} {{email}} {{titulo_documento}}
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_template (
    id         INT          NOT NULL DEFAULT 1,
    subject    VARCHAR(255) NOT NULL,
    body       LONGTEXT     NOT NULL,
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT chk_email_template_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  REGISTRO DE SOLICITUDES DE ENVÍO — auditoría del consentimiento RGPD
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solution_request_log (
    id                   BINARY(16)   NOT NULL,
    node_id              BINARY(16)   NULL,
    nombre               VARCHAR(150) NOT NULL,
    apellidos            VARCHAR(150) NOT NULL,
    nacionalidad         VARCHAR(100) NOT NULL,
    telefono             VARCHAR(30)  NOT NULL,
    email                VARCHAR(150) NOT NULL,
    acepta_privacidad    TINYINT(1)   NOT NULL,
    acepta_tratamiento   TINYINT(1)   NOT NULL,
    ip_address           VARCHAR(45)  NULL,
    sent_ok              TINYINT(1)   NOT NULL DEFAULT 0,
    created_at           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_solreq_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    INDEX idx_solreq_email (email),
    INDEX idx_solreq_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

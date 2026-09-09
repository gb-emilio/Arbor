-- ============================================================
--  ArborQ — Esquema MySQL 8
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

INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
    (0x00000000000000000000000000000099,
     'admin', 'admin@arborq.local',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'ADMIN');

-- ------------------------------------------------------------
--  NODOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nodes (
    id          BINARY(16)  NOT NULL,
    type        VARCHAR(10) NOT NULL,
    text        TEXT        NOT NULL,
    description TEXT,
    parent_id   BINARY(16)  NULL,
    position    INT         NOT NULL DEFAULT 0,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
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
--  DATOS DE EJEMPLO
--  Árbol: Incidencia → [Hardware → ¿Enciende? → [Sí→Periféricos, No→Arranque]]
--                      [Software → ¿SO?        → [Windows→Manual, macOS→Guía]]
-- ------------------------------------------------------------
INSERT IGNORE INTO nodes (id, type, text, description, parent_id, position) VALUES
    (0x00000000000000000000000000000001, 'question', '¿Cuál es el tipo de incidencia?', 'Primera clasificación.', NULL, 0);

INSERT IGNORE INTO nodes (id, type, text, parent_id, position) VALUES
    (0x00000000000000000000000000000002, 'question', '¿El equipo enciende?',      0x00000000000000000000000000000001, 0),
    (0x00000000000000000000000000000003, 'question', '¿Qué sistema operativo?',   0x00000000000000000000000000000001, 1),
    (0x00000000000000000000000000000005, 'leaf',     'Guía diagnóstico arranque', 0x00000000000000000000000000000002, 0),
    (0x00000000000000000000000000000006, 'leaf',     'Protocolo revisión periféricos', 0x00000000000000000000000000000002, 1),
    (0x00000000000000000000000000000007, 'leaf',     'Manual Windows 11 corporativo',  0x00000000000000000000000000000003, 0),
    (0x00000000000000000000000000000008, 'leaf',     'Guía macOS Ventura IT',     0x00000000000000000000000000000003, 1);

-- Opciones con target_node_id apuntando al nodo hijo correspondiente
INSERT IGNORE INTO options (id, node_id, label, position, target_node_id) VALUES
    (0x00000000000000000000000000000101, 0x00000000000000000000000000000001, 'Hardware', 0, 0x00000000000000000000000000000002),
    (0x00000000000000000000000000000102, 0x00000000000000000000000000000001, 'Software', 1, 0x00000000000000000000000000000003),
    (0x00000000000000000000000000000103, 0x00000000000000000000000000000001, 'Red',      2, NULL),
    (0x00000000000000000000000000000104, 0x00000000000000000000000000000002, 'No (no enciende)', 0, 0x00000000000000000000000000000005),
    (0x00000000000000000000000000000105, 0x00000000000000000000000000000002, 'Sí (enciende)',    1, 0x00000000000000000000000000000006),
    (0x00000000000000000000000000000106, 0x00000000000000000000000000000003, 'Windows', 0, 0x00000000000000000000000000000007),
    (0x00000000000000000000000000000107, 0x00000000000000000000000000000003, 'macOS',   1, 0x00000000000000000000000000000008),
    (0x00000000000000000000000000000108, 0x00000000000000000000000000000003, 'Linux',   2, NULL);

-- ── Campos de servicios para nodos hoja ──────────────────────────────────
ALTER TABLE nodes
  ADD COLUMN IF NOT EXISTS service_link_url    VARCHAR(500) NULL COMMENT 'URL del enlace personalizado (recuadro 1)',
  ADD COLUMN IF NOT EXISTS service_link_label  VARCHAR(200) NULL COMMENT 'Texto del botón del enlace personalizado',
  ADD COLUMN IF NOT EXISTS paypal_button_id    VARCHAR(200) NULL COMMENT 'Hosted Button ID de PayPal (recuadro 2)',
  ADD COLUMN IF NOT EXISTS calendly_url        VARCHAR(500) NULL COMMENT 'URL del widget de Calendly (recuadro 3)';

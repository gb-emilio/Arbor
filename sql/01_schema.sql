-- ============================================================
--  ArborQ — Esquema MySQL 8
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ------------------------------------------------------------
--  USUARIOS
-- ------------------------------------------------------------
CREATE TABLE users (
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

INSERT INTO users (`id`,`username`,`email`,`password_hash`,`role`,`enabled`,`created_at`,`updated_at`) VALUES (UUID_TO_BIN('a12146d4-e0a0-4a1e-b7c9-f181d7a956e1'),'admin','admin@arborq.local','$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','ADMIN',1,'2026-05-25 12:19:52.643040','2026-05-25 12:19:52.643040');
INSERT INTO users (`id`,`username`,`email`,`password_hash`,`role`,`enabled`,`created_at`,`updated_at`) VALUES (UUID_TO_BIN('a12146d4-e0a0-4a1e-b7c9-f181d7a956e2'),'emi','emi@arborq.local','$2a$12$GpPdqDkR/GFzIHBzTChJHeZblquRuJykER6Sikkt7uCHMpFqVVuQ.','ADMIN',1,'2026-08-25 16:07:22.984059','2026-08-25 16:11:06.423024');
INSERT INTO users (`id`,`username`,`email`,`password_hash`,`role`,`enabled`,`created_at`,`updated_at`) VALUES (UUID_TO_BIN('a12146d4-e0a0-4a1e-b7c9-f181d7a956e3'),'breisy','breisy@arborq.local','$2a$12$.DgSBoRnfoyZq/IUWpEu9OHAlYZUGq9kSFsCQ.FEbKj8jMdfP0XC2','USER',1,'2026-08-25 16:14:57.878636','2026-08-25 16:14:57.878636');
INSERT INTO users (`id`,`username`,`email`,`password_hash`,`role`,`enabled`,`created_at`,`updated_at`) VALUES (UUID_TO_BIN('a12146d4-e0a0-4a1e-b7c9-f181d7a956e4'),'user','user@gmail.com','$2a$12$G1u.cmYFembollUAQ021fe.6pfOm0PrRNoFGbE9mousQi.zZydRZO','USER',1,'2026-05-23 10:09:26.704294','2026-05-23 10:09:26.704355');


-- ------------------------------------------------------------
--  NODOS
-- ------------------------------------------------------------
CREATE TABLE nodes (
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
CREATE TABLE options (
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
CREATE TABLE pdf_files (
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
-- ------------------------------------------------------------
INSERT INTO `nodes` (`id`, `type`, `text`, `description`, `parent_id`, `position`, `created_at`, `updated_at`, `service_link_url`, `service_link_label`, `paypal_button_id`, `calendly_url`) VALUES (0x0E02573BF36D43EF8681325DAE5280E2,'question','Me quiero mudar a España','',NULL,1,'2026-05-25 13:19:24.780241','2026-05-25 13:19:24.780268',NULL,NULL,NULL,NULL),(0x3E625F375FCE4423AFF551E47870E3D0,'question','Empieza la búsqueda','',NULL,2,'2026-05-25 13:37:12.292368','2026-05-25 13:37:12.292384',NULL,NULL,NULL,NULL),(0x6AC2D25F353541B58046D9CDEFD8D7EE,'question','¿Eres ciudadano de la UE?','',0x0E02573BF36D43EF8681325DAE5280E2,0,'2026-05-25 13:20:22.277719','2026-05-25 13:20:22.277742',NULL,NULL,NULL,NULL),(0xB82D49C52BDB4C7097840103E2453E38,'leaf','Instrucciones ABC','',0x6AC2D25F353541B58046D9CDEFD8D7EE,1,'2026-05-25 13:27:02.885117','2026-05-25 14:46:22.577282','http://www.gmail.com','GMAIL','ABC89098988','https://valendy.com/breisy/30min'),(0xF51E15340BA54471884A17389463A9FA,'question','¿Cual es el motivo para mudarte?','',0x6AC2D25F353541B58046D9CDEFD8D7EE,0,'2026-05-25 13:21:15.024138','2026-05-25 13:21:15.024157',NULL,NULL,NULL,NULL),(0xF663326EDCD74A2D857353D1BA0BE439,'question','Quiero visitar España','',NULL,0,'2026-05-25 13:16:33.103313','2026-05-25 13:16:33.103354',NULL,NULL,NULL,NULL);
INSERT INTO `options` (`id`, `node_id`, `label`, `position`, `target_node_id`, `created_at`) VALUES (0x27838C18578C44A7AC702EB4A58F7065,0x3E625F375FCE4423AFF551E47870E3D0,'Me quiero mudar a España',0,0x0E02573BF36D43EF8681325DAE5280E2,'2026-05-25 13:37:12.295822'),(0x3575397B3B1D497CB86F0572909CEF3F,0x3E625F375FCE4423AFF551E47870E3D0,'Quiero visitar España',1,0xF663326EDCD74A2D857353D1BA0BE439,'2026-05-25 13:37:12.296825'),(0x8F5F847663CB42C3B674A6C1A99BADF0,0x6AC2D25F353541B58046D9CDEFD8D7EE,'Si',0,0xB82D49C52BDB4C7097840103E2453E38,'2026-05-25 13:27:52.799246'),(0xD4F52E17B9C74682AF7FE58BF26F98BA,0x0E02573BF36D43EF8681325DAE5280E2,'Si',0,0x6AC2D25F353541B58046D9CDEFD8D7EE,'2026-05-25 13:27:30.111449'),(0xFE805C8EB364472D8CC7E9E1D5BCC674,0x6AC2D25F353541B58046D9CDEFD8D7EE,'No',1,0xF51E15340BA54471884A17389463A9FA,'2026-05-25 13:27:52.803232');


-- ── Campos de servicios para nodos hoja ──────────────────────────────────
ALTER TABLE nodes
  ADD COLUMN service_link_url    VARCHAR(500) NULL COMMENT 'URL del enlace personalizado (recuadro 1)',
  ADD COLUMN service_link_label  VARCHAR(200) NULL COMMENT 'Texto del botón del enlace personalizado',
  ADD COLUMN paypal_button_id    VARCHAR(200) NULL COMMENT 'Hosted Button ID de PayPal (recuadro 2)',
  ADD COLUMN calendly_url        VARCHAR(500) NULL COMMENT 'URL del widget de Calendly (recuadro 3)';

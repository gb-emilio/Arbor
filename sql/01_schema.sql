-- ============================================================
--  ArborQ — Esquema PostgreSQL completo
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
--  Función trigger updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ------------------------------------------------------------
--  USUARIOS
-- ------------------------------------------------------------
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER')),
    enabled       BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Admin por defecto — contraseña: Admin1234!
-- BCrypt coste 12 — NUNCA texto plano en base de datos
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin','admin@arborq.local',
     '$2a$12$wJv8EqPkGm1Tz9Nr0Li4BeHxKOdAs5cFpV2RuY7bXjI3hWQ6nMeD.',
     'ADMIN');

-- ------------------------------------------------------------
--  NODOS
-- ------------------------------------------------------------
CREATE TABLE nodes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type        VARCHAR(10) NOT NULL CHECK (type IN ('question','leaf')),
    text        TEXT        NOT NULL,
    description TEXT,
    parent_id   UUID        REFERENCES nodes(id) ON DELETE CASCADE,
    position    INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nodes_parent ON nodes(parent_id);
CREATE TRIGGER trg_nodes_updated_at
    BEFORE UPDATE ON nodes FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ------------------------------------------------------------
--  OPCIONES
-- ------------------------------------------------------------
CREATE TABLE options (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id    UUID        NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    label      TEXT        NOT NULL,
    position   INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_options_node ON options(node_id);

-- ------------------------------------------------------------
--  ARCHIVOS PDF
-- ------------------------------------------------------------
CREATE TABLE pdf_files (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id      UUID         NOT NULL UNIQUE REFERENCES nodes(id) ON DELETE CASCADE,
    filename     VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_size    BIGINT,
    data         BYTEA        NOT NULL,
    uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  DATOS DE EJEMPLO
-- ------------------------------------------------------------
INSERT INTO nodes (id,type,text,description,parent_id,position) VALUES
    ('00000000-0000-0000-0000-000000000001','question','¿Cuál es el tipo de incidencia?','Primera clasificación.',NULL,0);
INSERT INTO options (node_id,label,position) VALUES
    ('00000000-0000-0000-0000-000000000001','Hardware',0),
    ('00000000-0000-0000-0000-000000000001','Software',1),
    ('00000000-0000-0000-0000-000000000001','Red',2);
INSERT INTO nodes (id,type,text,parent_id,position) VALUES
    ('00000000-0000-0000-0000-000000000002','question','¿El equipo enciende?','00000000-0000-0000-0000-000000000001',0),
    ('00000000-0000-0000-0000-000000000003','question','¿Qué sistema operativo?','00000000-0000-0000-0000-000000000001',1),
    ('00000000-0000-0000-0000-000000000005','leaf','Guía diagnóstico arranque','00000000-0000-0000-0000-000000000002',0),
    ('00000000-0000-0000-0000-000000000006','leaf','Protocolo revisión periféricos','00000000-0000-0000-0000-000000000002',1),
    ('00000000-0000-0000-0000-000000000007','leaf','Manual Windows 11 corporativo','00000000-0000-0000-0000-000000000003',0),
    ('00000000-0000-0000-0000-000000000008','leaf','Guía macOS Ventura IT','00000000-0000-0000-0000-000000000003',1);
INSERT INTO options (node_id,label,position) VALUES
    ('00000000-0000-0000-0000-000000000002','Sí',0),
    ('00000000-0000-0000-0000-000000000002','No',1),
    ('00000000-0000-0000-0000-000000000003','Windows',0),
    ('00000000-0000-0000-0000-000000000003','macOS',1),
    ('00000000-0000-0000-0000-000000000003','Linux',2);

-- ============================================================
--  USUARIOS Y AUTENTICACIÓN
-- ============================================================

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER')),
    enabled       BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email    ON users(email);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Admin por defecto: admin / Admin1234!
-- Hash BCrypt coste 12 de "Admin1234!"
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@arborq.local',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'ADMIN');

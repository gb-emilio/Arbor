# ArborQ — Documentación API REST

Base URL: `http://localhost:8080/api/v1`

---

## Endpoints de Nodos

### GET /nodes
Devuelve el árbol completo de forma recursiva.

**Respuesta 200**
```json
[
  {
    "id": "uuid",
    "type": "question",
    "text": "¿Cuál es el tipo de incidencia?",
    "description": "Primera pregunta de clasificación",
    "parentId": null,
    "position": 0,
    "options": ["Hardware", "Software", "Red"],
    "children": [ {...}, {...} ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### GET /nodes/roots
Devuelve solo los nodos raíz (sin hijos recursivos).

---

### GET /nodes/{id}
Devuelve un nodo específico con sus hijos directos.

**Respuesta 404** si el nodo no existe.

---

### GET /nodes/{id}/children
Devuelve los hijos directos de un nodo.

---

### POST /nodes
Crea un nuevo nodo.

**Body**
```json
{
  "type": "question",
  "text": "¿Tiene garantía el equipo?",
  "description": "Opcional",
  "parentId": "uuid-del-padre",
  "position": 0,
  "options": ["Sí", "No", "No sé"]
}
```

| Campo      | Obligatorio | Valores            | Descripción                         |
|------------|-------------|-------------------|-------------------------------------|
| `type`     | ✅           | `question`, `leaf` | Tipo de nodo                        |
| `text`     | ✅           | string            | Texto de la pregunta o título       |
| `parentId` | ❌           | UUID / null       | null = nodo raíz                   |
| `options`  | ❌           | array string      | Solo para `type=question`           |

**Respuesta 201** con el nodo creado.

---

### PUT /nodes/{id}
Actualiza texto, descripción y opciones de un nodo.

**Body** igual que POST. Las opciones se reemplazan completamente.

**Respuesta 200** con el nodo actualizado.

---

### PATCH /nodes/{id}/reorder-children
Reordena los hijos de un nodo.

**Body**
```json
{
  "orderedChildIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Respuesta 200** con la lista reordenada.

---

### DELETE /nodes/{id}
Elimina un nodo y **todos sus descendientes** (CASCADE).

**Respuesta 204** sin cuerpo.

---

## Endpoints PDF

### POST /nodes/{id}/pdf
Sube un archivo PDF a un nodo tipo `leaf`.

**Content-Type:** `multipart/form-data`  
**Campo:** `file` (archivo PDF, máx. 50 MB)

```bash
curl -X POST http://localhost:8080/api/v1/nodes/{id}/pdf \
  -F "file=@documento.pdf"
```

**Respuesta 201**
```json
{
  "id": "uuid",
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "fileSize": 204800,
  "uploadedAt": "2024-01-15T10:05:00Z"
}
```

---

### GET /nodes/{id}/pdf
Descarga el PDF asociado al nodo.

**Respuesta 200** con `Content-Type: application/pdf` y el binario del archivo.

```bash
curl -o resultado.pdf http://localhost:8080/api/v1/nodes/{id}/pdf
```

---

### DELETE /nodes/{id}/pdf
Elimina el PDF del nodo (el nodo permanece).

**Respuesta 204** sin cuerpo.

---

## Errores

Todos los errores siguen este formato:
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Nodo no encontrado: uuid",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

| Código | Situación                                      |
|--------|------------------------------------------------|
| 400    | Parámetros inválidos o tipo incorrecto         |
| 404    | Nodo o PDF no encontrado                       |
| 413    | Archivo supera el límite de 50 MB              |
| 422    | Error de validación del body                   |
| 500    | Error interno del servidor                     |

---

## Arranque rápido

```bash
# 1. Levantar PostgreSQL + API con Docker
docker-compose up -d

# 2. Esperar ~30 segundos y verificar
curl http://localhost:8080/api/v1/nodes

# 3. (Opcional) Solo la base de datos, API en IDE
docker-compose up -d postgres
./mvnw spring-boot:run
```

## Estructura de la base de datos

```
nodes
  id UUID PK
  type VARCHAR(10)   -- 'question' | 'leaf'
  text TEXT
  description TEXT
  parent_id UUID FK  -- self-reference, null = raíz
  position INT       -- orden entre hermanos
  created_at, updated_at TIMESTAMPTZ

options
  id UUID PK
  node_id UUID FK → nodes
  label TEXT
  position INT

pdf_files
  id UUID PK
  node_id UUID FK → nodes (UNIQUE — 1 PDF por nodo)
  filename VARCHAR
  content_type VARCHAR
  file_size BIGINT
  data BYTEA         -- contenido binario
  uploaded_at TIMESTAMPTZ
```

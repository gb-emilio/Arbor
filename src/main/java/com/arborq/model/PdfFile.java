package com.arborq.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pdf_files")
@Getter @Setter
@NoArgsConstructor
public class PdfFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @Column(nullable = false, length = 255)
    private String filename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    /**
     * BYTEA en PostgreSQL.
     * @JdbcTypeCode(SqlTypes.BINARY) evita el mapeo OID que usa @Lob
     * en Hibernate 6 con el driver PostgreSQL.
     */
    @Column(nullable = false, columnDefinition = "bytea")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] data;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private OffsetDateTime uploadedAt;
}

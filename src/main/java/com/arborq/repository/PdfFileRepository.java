package com.arborq.repository;

import com.arborq.model.PdfFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PdfFileRepository extends JpaRepository<PdfFile, UUID> {
    Optional<PdfFile> findByNodeId(UUID nodeId);
    void deleteByNodeId(UUID nodeId);
}

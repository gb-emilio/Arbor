package com.arborq.repository;

import com.arborq.model.SolutionRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SolutionRequestLogRepository extends JpaRepository<SolutionRequestLog, UUID> {
}

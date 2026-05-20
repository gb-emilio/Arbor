package com.arborq.repository;

import com.arborq.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NodeRepository extends JpaRepository<Node, UUID> {

    /** Nodos raíz (sin padre), ordenados por posición */
    List<Node> findByParentIsNullOrderByPositionAsc();

    /** Hijos directos de un nodo, ordenados */
    List<Node> findByParentIdOrderByPositionAsc(UUID parentId);

    /** ¿Existe algún nodo con ese padre y esa posición? */
    boolean existsByParentIdAndPosition(UUID parentId, int position);

    /** Máxima posición entre hermanos (para appending) */
    @Query("SELECT COALESCE(MAX(n.position), -1) FROM Node n WHERE n.parent.id = :parentId")
    int maxPositionByParentId(UUID parentId);

    /** Máxima posición entre raíces */
    @Query("SELECT COALESCE(MAX(n.position), -1) FROM Node n WHERE n.parent IS NULL")
    int maxPositionRoots();
}

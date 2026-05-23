package com.arborq.service;

import com.arborq.dto.*;
import com.arborq.model.Node;
import com.arborq.model.Option;
import com.arborq.model.PdfFile;
import com.arborq.repository.NodeRepository;
import com.arborq.repository.PdfFileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class NodeService {

    private final NodeRepository    nodeRepo;
    private final PdfFileRepository pdfRepo;

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NodeResponse> getFullTree() {
        return nodeRepo.findByParentIsNullOrderByPositionAsc()
                .stream().map(n -> toResponse(n, true)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NodeResponse getNode(UUID id) {
        return toResponse(findOrThrow(id), true);
    }

    @Transactional(readOnly = true)
    public List<NodeResponse> getRoots() {
        return nodeRepo.findByParentIsNullOrderByPositionAsc()
                .stream().map(n -> toResponse(n, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NodeResponse> getChildren(UUID parentId) {
        findOrThrow(parentId);
        return nodeRepo.findByParentIdOrderByPositionAsc(parentId)
                .stream().map(n -> toResponse(n, false)).collect(Collectors.toList());
    }

    // ── CREATE ───────────────────────────────────────────────────────────────

    @Transactional
    public NodeResponse createNode(NodeRequest req) {
        Node node = Node.create(req.getType(), req.getText().trim(), req.getDescription());

        if (req.getParentId() != null) {
            Node parent = findOrThrow(req.getParentId());
            node.setParent(parent);
            int pos = req.getPosition() != null
                    ? req.getPosition()
                    : nodeRepo.maxPositionByParentId(parent.getId()) + 1;
            node.setPosition(pos);
        } else {
            node.setPosition(nodeRepo.maxPositionRoots() + 1);
        }

        if (node.isQuestion() && req.getOptions() != null) {
            buildOptions(req.getOptions(), node).forEach(node::addOption);
        }

        Node saved = nodeRepo.save(node);
        log.info("Nodo creado: {} [{}]", saved.getId(), saved.getType());
        return toResponse(saved, true);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public NodeResponse updateNode(UUID id, NodeRequest req) {
        Node node = findOrThrow(id);
        node.setText(req.getText().trim());
        if (req.getDescription() != null) node.setDescription(req.getDescription());

        if (node.isQuestion()) {
            node.getOptions().clear();
            if (req.getOptions() != null) {
                buildOptions(req.getOptions(), node).forEach(node::addOption);
            }
        }

        if (req.getParentId() != null) {
            UUID currentParentId = node.getParent() != null ? node.getParent().getId() : null;
            if (!req.getParentId().equals(currentParentId)) {
                Node newParent = findOrThrow(req.getParentId());
                node.setParent(newParent);
                node.setPosition(nodeRepo.maxPositionByParentId(newParent.getId()) + 1);
            }
        }

        Node saved = nodeRepo.save(node);
        log.info("Nodo actualizado: {}", saved.getId());
        return toResponse(saved, true);
    }

    // ── REORDER ───────────────────────────────────────────────────────────────

    @Transactional
    public List<NodeResponse> reorderChildren(UUID parentId, ReorderRequest req) {
        findOrThrow(parentId);
        List<UUID> ordered = req.getOrderedChildIds();
        IntStream.range(0, ordered.size()).forEach(i -> {
            Node child = findOrThrow(ordered.get(i));
            child.setPosition(i);
            nodeRepo.save(child);
        });
        return getChildren(parentId);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteNode(UUID id) {
        nodeRepo.delete(findOrThrow(id));
        log.info("Nodo eliminado: {}", id);
    }

    // ── PDF ──────────────────────────────────────────────────────────────────

    @Transactional
    public PdfMetaResponse uploadPdf(UUID nodeId, MultipartFile file) throws IOException {
        Node node = findOrThrow(nodeId);
        if (!node.isLeaf()) throw new IllegalArgumentException("Solo los nodos tipo 'leaf' admiten PDF.");
        if (!isPdf(file))   throw new IllegalArgumentException("El archivo debe ser un PDF.");

        pdfRepo.findByNodeId(nodeId).ifPresent(pdfRepo::delete);

        PdfFile pdf = new PdfFile();
        pdf.setNode(node);
        pdf.setFilename(file.getOriginalFilename());
        pdf.setContentType(file.getContentType() != null ? file.getContentType() : "application/pdf");
        pdf.setFileSize(file.getSize());
        pdf.setData(file.getBytes());

        PdfFile saved = pdfRepo.save(pdf);
        log.info("PDF subido para nodo {}: {}", nodeId, saved.getFilename());
        return toPdfMeta(saved);
    }

    @Transactional(readOnly = true)
    public PdfFile downloadPdf(UUID nodeId) {
        return pdfRepo.findByNodeId(nodeId)
                .orElseThrow(() -> new EntityNotFoundException("No hay PDF en el nodo " + nodeId));
    }

    @Transactional
    public void deletePdf(UUID nodeId) {
        findOrThrow(nodeId);
        pdfRepo.delete(pdfRepo.findByNodeId(nodeId)
                .orElseThrow(() -> new EntityNotFoundException("No hay PDF en el nodo " + nodeId)));
        log.info("PDF eliminado del nodo {}", nodeId);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private Node findOrThrow(UUID id) {
        return nodeRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Nodo no encontrado: " + id));
    }

    private List<Option> buildOptions(List<NodeRequest.OptionRequest> reqs, Node node) {
        List<Option> result = new ArrayList<>();
        for (int i = 0; i < reqs.size(); i++) {
            NodeRequest.OptionRequest or = reqs.get(i);
            Option o = new Option();
            o.setNode(node);
            o.setLabel(or.getLabel().trim());
            o.setPosition(i);
            // Resolver el nodo destino si se especificó
            if (or.getTargetNodeId() != null) {
                nodeRepo.findById(or.getTargetNodeId()).ifPresent(o::setTargetNode);
            }
            result.add(o);
        }
        return result;
    }

    private boolean isPdf(MultipartFile file) {
        String ct = file.getContentType();
        String fn = file.getOriginalFilename();
        return "application/pdf".equalsIgnoreCase(ct)
                || (fn != null && fn.toLowerCase().endsWith(".pdf"));
    }

    // ── MAPPING ──────────────────────────────────────────────────────────────

    public NodeResponse toResponse(Node node, boolean recursive) {
        List<OptionResponse> opts = node.getOptions().stream()
                .map(o -> OptionResponse.builder()
                        .id(o.getId())
                        .label(o.getLabel())
                        .position(o.getPosition())
                        .targetNodeId(o.getTargetNode() != null ? o.getTargetNode().getId() : null)
                        .targetNodeText(o.getTargetNode() != null ? o.getTargetNode().getText() : null)
                        .build())
                .collect(Collectors.toList());

        PdfMetaResponse pdfMeta = null;
        if (node.isLeaf() && node.getPdfFile() != null) pdfMeta = toPdfMeta(node.getPdfFile());

        List<NodeResponse> children = null;
        if (recursive && !node.getChildren().isEmpty()) {
            children = node.getChildren().stream()
                    .map(c -> toResponse(c, true))
                    .collect(Collectors.toList());
        }

        NodeResponse resp = new NodeResponse();
        resp.setId(node.getId());
        resp.setType(node.getType());
        resp.setText(node.getText());
        resp.setDescription(node.getDescription());
        resp.setParentId(node.getParent() != null ? node.getParent().getId() : null);
        resp.setPosition(node.getPosition());
        resp.setOptions(opts.isEmpty() ? null : opts);
        resp.setPdf(pdfMeta);
        resp.setChildren(children);
        resp.setCreatedAt(node.getCreatedAt());
        resp.setUpdatedAt(node.getUpdatedAt());
        return resp;
    }

    private PdfMetaResponse toPdfMeta(PdfFile pdf) {
        PdfMetaResponse r = new PdfMetaResponse();
        r.setId(pdf.getId());
        r.setFilename(pdf.getFilename());
        r.setContentType(pdf.getContentType());
        r.setFileSize(pdf.getFileSize());
        r.setUploadedAt(pdf.getUploadedAt());
        return r;
    }
}

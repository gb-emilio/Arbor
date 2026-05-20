package com.arborq.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "nodes")
@Getter @Setter
@NoArgsConstructor
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 10)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Node parent;

    @Column(nullable = false)
    private int position;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Node> children = new ArrayList<>();

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Option> options = new ArrayList<>();

    @OneToOne(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PdfFile pdfFile;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /** Factory method que sustituye al @Builder */
    public static Node create(String type, String text, String description) {
        Node n = new Node();
        n.type        = type;
        n.text        = text;
        n.description = description;
        return n;
    }

    public boolean isQuestion() { return "question".equals(type); }
    public boolean isLeaf()     { return "leaf".equals(type); }

    public void addChild(Node child) {
        child.setParent(this);
        child.setPosition(this.children.size());
        this.children.add(child);
    }

    public void addOption(Option option) {
        option.setNode(this);
        option.setPosition(this.options.size());
        this.options.add(option);
    }
}

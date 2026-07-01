package com.lifeerp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notes")
public class Note extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String body;

    @Column(nullable = false)
    private String format = "MARKDOWN";

    @Column(length = 1000)
    private String tags;

    // ===== Flags =====

    @Column(nullable = false)
    private boolean pinned = false;

    @Column(nullable = false)
    private boolean favorite = false;

    @Column(nullable = false)
    private boolean archived = false;

    // ===== Appearance =====

    @Column(length = 20)
    private String color = "#ffffff";

    // ===== JSON Storage =====

    @Column(columnDefinition = "LONGTEXT")
    private String checklistJson = "[]";

    @Column(columnDefinition = "LONGTEXT")
    private String attachmentsJson = "[]";
}
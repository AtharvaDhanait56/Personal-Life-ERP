package com.lifeerp.repository;

import com.lifeerp.entity.DocumentAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<DocumentAsset, Long> {
    Page<DocumentAsset> findByUserId(Long userId, Pageable pageable);
}


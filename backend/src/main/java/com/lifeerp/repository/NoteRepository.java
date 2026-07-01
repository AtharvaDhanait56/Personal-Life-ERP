package com.lifeerp.repository;

import com.lifeerp.entity.Note;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Page<Note> findByUserId(Long userId, Pageable pageable);
    List<Note> findTop5ByUserIdOrderByUpdatedAtDesc(Long userId);
}


package com.lifeerp.repository;

import com.lifeerp.entity.Goal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    Page<Goal> findByUserId(Long userId, Pageable pageable);
    List<Goal> findTop6ByUserIdOrderByUpdatedAtDesc(Long userId);
}


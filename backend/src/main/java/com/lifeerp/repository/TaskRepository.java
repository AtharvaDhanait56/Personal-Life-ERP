package com.lifeerp.repository;

import com.lifeerp.entity.TaskItem;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    Page<TaskItem> findByUserId(Long userId, Pageable pageable);
    List<TaskItem> findTop8ByUserIdAndDueAtBetweenOrderByDueAtAsc(Long userId, Instant start, Instant end);
}


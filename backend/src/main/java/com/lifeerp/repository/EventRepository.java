package com.lifeerp.repository;

import com.lifeerp.entity.CalendarEvent;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<CalendarEvent, Long> {
    Page<CalendarEvent> findByUserId(Long userId, Pageable pageable);
    List<CalendarEvent> findTop8ByUserIdAndStartsAtAfterOrderByStartsAtAsc(Long userId, Instant now);
}


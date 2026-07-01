package com.lifeerp.repository;

import com.lifeerp.entity.Expense;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByUserId(Long userId, Pageable pageable);

    List<Expense> findByUserIdAndSpentOnBetween(
            Long userId,
            LocalDate start,
            LocalDate end
    );

    Page<Expense> findByUserIdAndSpentOnBetween(
            Long userId,
            LocalDate start,
            LocalDate end,
            Pageable pageable
    );
}
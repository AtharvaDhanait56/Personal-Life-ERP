package com.lifeerp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class CoreDtos {

    private CoreDtos() {
    }

    // ===========================
    // TASKS
    // ===========================

    public record TaskDto(
            Long id,
            @NotBlank String title,
            String description,
            String status,
            String priority,
            Instant dueAt,
            String recurrence,
            String labels
    ) {
    }

    // ===========================
    // EXPENSES
    // ===========================

    public record ExpenseDto(
            Long id,
            @NotBlank String title,
            @NotNull
            @DecimalMin("0.01")
            BigDecimal amount,
            LocalDate spentOn,
            String paymentMethod,
            String notes
    ) {
    }

    // ===========================
    // GOALS
    // ===========================

    public record GoalDto(
            Long id,
            @NotBlank String title,
            String description,
            String goalType,

            @Min(0)
            @Max(100)
            int progress,

            LocalDate targetDate
    ) {
    }

    // ===========================
    // NOTES
    // ===========================

    public record NoteDto(

            Long id,

            @NotBlank
            String title,

            String body,

            String format,

            String tags,

            boolean pinned,

            boolean favorite,

            boolean archived,

            String color,

            String checklistJson,

            String attachmentsJson,

            Instant createdAt,

            Instant updatedAt

    ) {
    }

    // ===========================
    // DOCUMENTS
    // ===========================

    public record DocumentDto(

            Long id,

            @NotBlank
            String title,

            String documentType,

            String fileName,

            String storagePath,

            String contentType,

            long sizeBytes

    ) {
    }

    // ===========================
    // EVENTS
    // ===========================

    public record EventDto(

            Long id,

            @NotBlank
            String title,

            String description,

            String eventType,

            Instant startsAt,

            Instant endsAt,

            Instant reminderAt,

            boolean completed

    ) {
    }

    // ===========================
    // DASHBOARD
    // ===========================

    public record DashboardDto(

            List<TaskDto> todaysTasks,

            List<ExpenseDto> todaysExpenses,

            List<EventDto> upcomingEvents,

            List<GoalDto> goalProgress,

            List<NoteDto> quickNotes,

            BigDecimal monthSpend,

            int productivityScore

    ) {
    }
}
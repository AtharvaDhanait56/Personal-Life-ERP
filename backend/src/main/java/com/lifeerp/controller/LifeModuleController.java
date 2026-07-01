package com.lifeerp.controller;

import com.lifeerp.dto.CoreDtos.DashboardDto;
import com.lifeerp.dto.CoreDtos.DocumentDto;
import com.lifeerp.dto.CoreDtos.EventDto;
import com.lifeerp.dto.CoreDtos.ExpenseDto;
import com.lifeerp.dto.CoreDtos.GoalDto;
import com.lifeerp.dto.CoreDtos.NoteDto;
import com.lifeerp.dto.CoreDtos.TaskDto;
import com.lifeerp.service.LifeModuleService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class LifeModuleController {

    private final LifeModuleService service;

    public LifeModuleController(LifeModuleService service) {
        this.service = service;
    }

    // ==========================
    // Dashboard
    // ==========================

    @GetMapping("/dashboard")
    public DashboardDto dashboard() {
        return service.dashboard();
    }

    // ==========================
    // Tasks
    // ==========================

    @GetMapping("/tasks")
    public Page<TaskDto> tasks(Pageable pageable) {
        return service.tasks(pageable);
    }

    @PostMapping("/tasks")
    public TaskDto createTask(@Valid @RequestBody TaskDto dto) {
        return service.saveTask(dto);
    }

    @PutMapping("/tasks/{id}")
    public TaskDto updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto dto) {

        return service.saveTask(
                new TaskDto(
                        id,
                        dto.title(),
                        dto.description(),
                        dto.status(),
                        dto.priority(),
                        dto.dueAt(),
                        dto.recurrence(),
                        dto.labels()));
    }

    // ==========================
    // Expenses
    // ==========================

    @GetMapping("/expenses")
    public Page<ExpenseDto> expenses(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Pageable pageable) {

        return service.expenses(month, year, pageable);
    }

    @PostMapping("/expenses")
    public ExpenseDto createExpense(
            @Valid @RequestBody ExpenseDto dto) {

        return service.saveExpense(dto);
    }

    // ==========================
    // Goals
    // ==========================

    @GetMapping("/goals")
    public Page<GoalDto> goals(Pageable pageable) {
        return service.goals(pageable);
    }

    @PostMapping("/goals")
    public GoalDto createGoal(
            @Valid @RequestBody GoalDto dto) {

        return service.saveGoal(dto);
    }

    @PutMapping("/goals/{id}")
    public GoalDto updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalDto dto) {

        return service.saveGoal(
                new GoalDto(
                        id,
                        dto.title(),
                        dto.description(),
                        dto.goalType(),
                        dto.progress(),
                        dto.targetDate()));
    }

    @DeleteMapping("/goals/{id}")
    public void deleteGoal(@PathVariable Long id) {
        service.delete("goals", id);
    }

    // ==========================
    // Notes
    // ==========================

    @GetMapping("/notes")
    public Page<NoteDto> notes(Pageable pageable) {
        return service.notes(pageable);
    }

    @PostMapping("/notes")
    public NoteDto createNote(
            @Valid @RequestBody NoteDto dto) {

        return service.saveNote(dto);
    }

    @PutMapping("/notes/{id}")
    public NoteDto updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteDto dto) {

        return service.saveNote(
                new NoteDto(
                        id,
                        dto.title(),
                        dto.body(),
                        dto.format(),
                        dto.tags(),
                        dto.pinned(),
                        dto.favorite(),
                        dto.archived(),
                        dto.color(),
                        dto.checklistJson(),
                        dto.attachmentsJson(),
                        dto.createdAt(),
                        dto.updatedAt()));
    }

    @DeleteMapping("/notes/{id}")
    public void deleteNote(@PathVariable Long id) {
        service.delete("notes", id);
    }
        // ==========================
    // Documents
    // ==========================

    @GetMapping("/documents")
    public Page<DocumentDto> documents(Pageable pageable) {
        return service.documents(pageable);
    }

    @PostMapping("/documents")
    public DocumentDto createDocument(
            @Valid @RequestBody DocumentDto dto) {

        return service.saveDocument(dto);
    }

    @PostMapping(
            value = "/documents/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentDto uploadDocument(
            @RequestParam String title,
            @RequestParam MultipartFile file) {

        return service.uploadDocument(title, file);
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @RequestParam(name = "inline", defaultValue = "false") boolean inline) {

        var file = service.documentFile(id);
        String dispositionType = inline ? "inline" : "attachment";
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(file.contentType());
        } catch (RuntimeException ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        dispositionType + "; filename=\"" + file.fileName() + "\"")
                .contentType(mediaType)
                .body(file.resource());
    }

    // ==========================
    // Events
    // ==========================

    @GetMapping("/events")
    public Page<EventDto> events(Pageable pageable) {
        return service.events(pageable);
    }

    @PostMapping("/events")
    public EventDto createEvent(
            @Valid @RequestBody EventDto dto) {

        return service.saveEvent(dto);
    }

    @PutMapping("/events/{id}")
    public EventDto updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventDto dto) {

        return service.saveEvent(
                new EventDto(
                        id,
                        dto.title(),
                        dto.description(),
                        dto.eventType(),
                        dto.startsAt(),
                        dto.endsAt(),
                        dto.reminderAt(),
                        dto.completed()));
    }

    // Delete for events goes through the generic /{module}/{id} route below
    // (module = "events"), same as documents.

    // ==========================
    // Generic Delete
    // ==========================

    @DeleteMapping("/{module}/{id}")
    public void delete(
            @PathVariable String module,
            @PathVariable Long id) {

        service.delete(module, id);
    }

    // ==========================
    // Analytics
    // ==========================

    @GetMapping("/analytics/productivity")
    public DashboardDto productivity() {
        return service.dashboard();
    }

}

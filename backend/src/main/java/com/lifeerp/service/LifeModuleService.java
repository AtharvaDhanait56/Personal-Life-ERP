package com.lifeerp.service;

import com.lifeerp.dto.CoreDtos.DashboardDto;
import com.lifeerp.dto.CoreDtos.DocumentDto;
import com.lifeerp.dto.CoreDtos.EventDto;
import com.lifeerp.dto.CoreDtos.ExpenseDto;
import com.lifeerp.dto.CoreDtos.GoalDto;
import com.lifeerp.dto.CoreDtos.NoteDto;
import com.lifeerp.dto.CoreDtos.TaskDto;
import com.lifeerp.entity.CalendarEvent;
import com.lifeerp.entity.DocumentAsset;
import com.lifeerp.entity.Expense;
import com.lifeerp.entity.Goal;
import com.lifeerp.entity.Note;
import com.lifeerp.entity.TaskItem;
import com.lifeerp.entity.User;
import com.lifeerp.exception.ApiException;
import com.lifeerp.repository.DocumentRepository;
import com.lifeerp.repository.EventRepository;
import com.lifeerp.repository.ExpenseRepository;
import com.lifeerp.repository.GoalRepository;
import com.lifeerp.repository.NoteRepository;
import com.lifeerp.repository.TaskRepository;
import java.math.BigDecimal;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LifeModuleService {
    private final CurrentUserService currentUserService;
    private final TaskRepository taskRepository;
    private final ExpenseRepository expenseRepository;
    private final GoalRepository goalRepository;
    private final NoteRepository noteRepository;
    private final DocumentRepository documentRepository;
    private final EventRepository eventRepository;
    private final Path storageRoot;

    public LifeModuleService(CurrentUserService currentUserService, TaskRepository taskRepository,
                             ExpenseRepository expenseRepository, GoalRepository goalRepository,
                             NoteRepository noteRepository,
                             DocumentRepository documentRepository, EventRepository eventRepository,
                             @Value("${app.storage.local-root}") String storageRoot) {
        this.currentUserService = currentUserService;
        this.taskRepository = taskRepository;
        this.expenseRepository = expenseRepository;
        this.goalRepository = goalRepository;
        this.noteRepository = noteRepository;
        this.documentRepository = documentRepository;
        this.eventRepository = eventRepository;
        this.storageRoot = Path.of(storageRoot).toAbsolutePath().normalize();
    }

    public DashboardDto dashboard() {
        User user = currentUserService.user();
        LocalDate today = LocalDate.now();
        Instant start = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = today.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();
        List<Expense> monthExpenses = expenseRepository.findByUserIdAndSpentOnBetween(
                user.getId(), today.withDayOfMonth(1), today);
        BigDecimal monthSpend = monthExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        int productivityScore = Math.min(100, goalRepository.findTop6ByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream().mapToInt(Goal::getProgress).sum());
        return new DashboardDto(
                taskRepository.findTop8ByUserIdAndDueAtBetweenOrderByDueAtAsc(user.getId(), start, end).stream().map(this::taskDto).toList(),
                expenseRepository.findByUserIdAndSpentOnBetween(user.getId(), today, today).stream().map(this::expenseDto).toList(),
                eventRepository.findTop8ByUserIdAndStartsAtAfterOrderByStartsAtAsc(user.getId(), Instant.now()).stream().map(this::eventDto).toList(),
                goalRepository.findTop6ByUserIdOrderByUpdatedAtDesc(user.getId()).stream().map(this::goalDto).toList(),
                noteRepository.findTop5ByUserIdOrderByUpdatedAtDesc(user.getId()).stream().map(this::noteDto).toList(),
                monthSpend,
                productivityScore);
    }

    public Page<TaskDto> tasks(Pageable pageable) {
        return taskRepository.findByUserId(currentUserService.user().getId(), pageable).map(this::taskDto);
    }

    @Transactional
    public TaskDto saveTask(TaskDto dto) {
        TaskItem task = dto.id() == null ? new TaskItem() : taskRepository.findById(dto.id()).orElseThrow();
        task.setUser(currentUserService.user());
        task.setTitle(dto.title());
        task.setDescription(dto.description());
        task.setStatus(value(dto.status(), "TODO"));
        task.setPriority(value(dto.priority(), "MEDIUM"));
        task.setDueAt(dto.dueAt());
        task.setRecurrence(dto.recurrence());
        task.setLabels(dto.labels());
        return taskDto(taskRepository.save(task));
    }

    public Page<ExpenseDto> expenses(Integer month, Integer year, Pageable pageable) {

    User user = currentUserService.user();

    LocalDate today = LocalDate.now();

    int selectedMonth = (month == null) ? today.getMonthValue() : month;
    int selectedYear = (year == null) ? today.getYear() : year;

    LocalDate start = LocalDate.of(selectedYear, selectedMonth, 1);
    LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

    return expenseRepository
            .findByUserIdAndSpentOnBetween(
                    user.getId(),
                    start,
                    end,
                    pageable)
            .map(this::expenseDto);
}

    @Transactional
    public ExpenseDto saveExpense(ExpenseDto dto) {
        Expense expense = dto.id() == null ? new Expense() : expenseRepository.findById(dto.id()).orElseThrow();
        expense.setUser(currentUserService.user());
        expense.setTitle(dto.title());
        expense.setAmount(dto.amount());
        expense.setSpentOn(dto.spentOn() == null ? LocalDate.now() : dto.spentOn());
        expense.setPaymentMethod(dto.paymentMethod());
        expense.setNotes(dto.notes());
        return expenseDto(expenseRepository.save(expense));
    }

    public Page<GoalDto> goals(Pageable pageable) {
        return goalRepository.findByUserId(currentUserService.user().getId(), pageable).map(this::goalDto);
    }

    @Transactional
    public GoalDto saveGoal(GoalDto dto) {
        Goal goal = dto.id() == null ? new Goal() : goalRepository.findById(dto.id()).orElseThrow();
        goal.setUser(currentUserService.user());
        goal.setTitle(dto.title());
        goal.setDescription(dto.description());
        goal.setGoalType(value(dto.goalType(), "MONTHLY"));
        goal.setProgress(dto.progress());
        goal.setTargetDate(dto.targetDate());
        return goalDto(goalRepository.save(goal));
    }

    

    public Page<NoteDto> notes(Pageable pageable) {
        return noteRepository.findByUserId(currentUserService.user().getId(), pageable).map(this::noteDto);
    }

    @Transactional
public NoteDto saveNote(NoteDto dto) {

    Note note = dto.id() == null
            ? new Note()
            : noteRepository.findById(dto.id()).orElseThrow();

    note.setUser(currentUserService.user());

    note.setTitle(dto.title());

    note.setBody(dto.body());

    note.setFormat(value(dto.format(), "MARKDOWN"));

    note.setTags(dto.tags());

    note.setPinned(dto.pinned());

    note.setFavorite(dto.favorite());

    note.setArchived(dto.archived());

    note.setColor(value(dto.color(), "#ffffff"));

    note.setChecklistJson(
            value(dto.checklistJson(), "[]"));

    note.setAttachmentsJson(
            value(dto.attachmentsJson(), "[]"));

    return noteDto(
            noteRepository.save(note));

}

    public Page<DocumentDto> documents(Pageable pageable) {
        return documentRepository.findByUserId(currentUserService.user().getId(), pageable).map(this::documentDto);
    }

    @Transactional
    public DocumentDto saveDocument(DocumentDto dto) {
        DocumentAsset document = dto.id() == null ? new DocumentAsset() : documentRepository.findById(dto.id()).orElseThrow();
        document.setUser(currentUserService.user());
        document.setTitle(dto.title());
        document.setDocumentType(value(dto.documentType(), "PDF"));
        document.setFileName(value(dto.fileName(), dto.title()));
        document.setStoragePath(value(dto.storagePath(), "local://" + dto.title()));
        document.setContentType(value(dto.contentType(), "application/octet-stream"));
        document.setSizeBytes(dto.sizeBytes());
        return documentDto(documentRepository.save(document));
    }

    @Transactional
    public DocumentDto uploadDocument(String title, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        try {
            Files.createDirectories(storageRoot);
            String originalName = value(file.getOriginalFilename(), "document");
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedName = UUID.randomUUID() + "-" + safeName;
            Path target = storageRoot.resolve(storedName).normalize();
            if (!target.startsWith(storageRoot)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid file name");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            DocumentAsset document = new DocumentAsset();
            document.setUser(currentUserService.user());
            document.setTitle(value(title, safeName));
            document.setDocumentType(file.getContentType() != null && file.getContentType().contains("pdf") ? "PDF" : "FILE");
            document.setFileName(safeName);
            document.setStoragePath(target.toString());
            document.setContentType(value(file.getContentType(), "application/octet-stream"));
            document.setSizeBytes(file.getSize());
            return documentDto(documentRepository.save(document));
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
        }
    }

    public record DocumentFile(Resource resource, String contentType, String fileName) {
    }

    public DocumentFile documentFile(Long id) {
        User user = currentUserService.user();
        DocumentAsset document = documentRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found"));
        if (!document.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Document not found");
        }
        Path path = Path.of(document.getStoragePath()).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Stored file not found");
        }
        String contentType = value(document.getContentType(), "application/octet-stream");
        String fileName = value(document.getFileName(), "download");
        return new DocumentFile(new FileSystemResource(path), contentType, fileName);
    }

    public Page<EventDto> events(Pageable pageable) {
        return eventRepository.findByUserId(currentUserService.user().getId(), pageable).map(this::eventDto);
    }

    @Transactional
    public EventDto saveEvent(EventDto dto) {
        CalendarEvent event = dto.id() == null ? new CalendarEvent() : eventRepository.findById(dto.id()).orElseThrow();
        event.setUser(currentUserService.user());
        event.setTitle(dto.title());
        event.setDescription(dto.description());
        event.setEventType(value(dto.eventType(), "EVENT"));
        event.setStartsAt(dto.startsAt() == null ? Instant.now() : dto.startsAt());
        event.setEndsAt(dto.endsAt());
        event.setReminderAt(dto.reminderAt());
        event.setCompleted(dto.completed());
        return eventDto(eventRepository.save(event));
    }

    @Transactional
    public void delete(String module, Long id) {
        switch (module) {
            case "tasks" -> taskRepository.deleteById(id);
            case "expenses" -> expenseRepository.deleteById(id);
            case "goals" -> goalRepository.deleteById(id);
            case "notes" -> noteRepository.deleteById(id);
            case "documents" -> documentRepository.deleteById(id);
            case "events" -> eventRepository.deleteById(id);
            default -> throw new ApiException(HttpStatus.NOT_FOUND, "Unsupported module");
        }
    }

    private String value(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private TaskDto taskDto(TaskItem task) {
        return new TaskDto(task.getId(), task.getTitle(), task.getDescription(), task.getStatus(), task.getPriority(),
                task.getDueAt(), task.getRecurrence(), task.getLabels());
    }

    private ExpenseDto expenseDto(Expense expense) {
        return new ExpenseDto(expense.getId(), expense.getTitle(), expense.getAmount(), expense.getSpentOn(),
                expense.getPaymentMethod(), expense.getNotes());
    }

    private GoalDto goalDto(Goal goal) {
        return new GoalDto(goal.getId(), goal.getTitle(), goal.getDescription(), goal.getGoalType(),
                goal.getProgress(), goal.getTargetDate());
    }

    private NoteDto noteDto(Note note) {

    return new NoteDto(

            note.getId(),

            note.getTitle(),

            note.getBody(),

            note.getFormat(),

            note.getTags(),

            note.isPinned(),

            note.isFavorite(),

            note.isArchived(),

            note.getColor(),

            note.getChecklistJson(),

            note.getAttachmentsJson(),

            note.getCreatedAt(),

            note.getUpdatedAt()

    );

}

    private DocumentDto documentDto(DocumentAsset document) {
        return new DocumentDto(document.getId(), document.getTitle(), document.getDocumentType(), document.getFileName(),
                document.getStoragePath(), document.getContentType(), document.getSizeBytes());
    }

    private EventDto eventDto(CalendarEvent event) {
        return new EventDto(event.getId(), event.getTitle(), event.getDescription(), event.getEventType(),
                event.getStartsAt(), event.getEndsAt(), event.getReminderAt(), event.isCompleted());
    }
}

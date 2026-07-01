import axios from "axios";
import type { DashboardData, DocumentAsset, EventItem, Expense, Goal , Note, PageResponse, Task } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") ?? localStorage.getItem("life-erp-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const page = async <T>(
  path: string,
  params: Record<string, unknown> = {}
) => {
  const response = await api.get<PageResponse<T>>(path, {
    params: {
      size: 100,
      ...params,
    },
  });

  return response.data.content;
};

export const fetchDashboard = async () => {
  const response = await api.get<DashboardData>("/dashboard");
  return response.data;
};

export const fetchTasks = () => page<Task>("/tasks");

export const fetchExpenses = (
  month?: number,
  year?: number
) =>
  page<Expense>("/expenses", {
    month,
    year,
  });

export const fetchGoals = () => page<Goal>("/goals");
export const fetchNotes = () => page<Note>("/notes");
export const fetchDocuments = () => page<DocumentAsset>("/documents");
export const fetchEvents = () => page<EventItem>("/events");

export const createEvent = async (input: {
  title: string;
  description?: string;
  eventType?: string;
  startsAt: string;
  endsAt?: string;
  reminderAt?: string;
}) => {
  const response = await api.post<EventItem>("/events", {
    title: input.title,
    description: input.description ?? "",
    eventType: input.eventType ?? "EVENT",
    startsAt: input.startsAt,
    endsAt: input.endsAt || undefined,
    reminderAt: input.reminderAt || undefined,
    completed: false,
  });
  return response.data;
};

export const updateEvent = async (event: EventItem) => {
  const response = await api.put<EventItem>(`/events/${event.id}`, event);
  return response.data;
};

export const deleteEvent = async (id: number) => {
  await api.delete(`/events/${id}`);
};

export const login = async (input: { email: string; password: string }) => {
  const response = await api.post<{ accessToken: string; refreshToken: string }>("/auth/login", input);
  return response.data;
};

export const register = async (input: { fullName: string; email: string; password: string }) => {
  const response = await api.post<{ accessToken: string; refreshToken: string }>("/auth/register", input);
  return response.data;
};

export type TaskInput = {
  title: string;
  description: string;
  priority: Task["priority"];
  status?: Task["status"];
  dueAt?: string;
  labels?: string;
};

export const createTask = async (input: TaskInput) => {
  const response = await api.post<Task>("/tasks", {
    title: input.title,
    description: input.description,
    status: input.status ?? "TODO",
    priority: input.priority,
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : new Date().toISOString(),
    labels: input.labels ?? "inbox"
  });
  return response.data;
};

export const updateTask = async (task: Task) => {
  const response = await api.put<Task>(`/tasks/${task.id}`, task);
  return response.data;
};

export const createExpense = async (input: {
  title: string;
  amount: number;
  spentOn: string;
  paymentMethod: string;
  notes: string;
}) => {
  const response = await api.post<Expense>("/expenses", input);
  return response.data;
};

export const createGoal = async (input: {
  title: string;
  description: string;
  goalType: Goal["goalType"];
  progress: number;
  targetDate: string;
}) => {
  const response = await api.post<Goal>("/goals", input);
  return response.data;
};

export const updateGoal = async (goal: Goal) => {
  const response = await api.put<Goal>(`/goals/${goal.id}`, goal);
  return response.data;
};

export const deleteGoal = async (id: number) => {
  await api.delete(`/goals/${id}`);
};



export const createNote = async (input: {
  title: string;
  body: string;
  format?: string;
  tags: string;
  pinned: boolean;

  favorite?: boolean;
  archived?: boolean;
  color?: string;

  checklistJson?: string;
  attachmentsJson?: string;
}) => {
  const response = await api.post<Note>("/notes", {
    title: input.title,
    body: input.body,
    format: input.format ?? "HTML",
    tags: input.tags,
    pinned: input.pinned,

    favorite: input.favorite ?? false,
    archived: input.archived ?? false,
    color: input.color ?? "#ffffff",

    checklistJson: input.checklistJson ?? "[]",
    attachmentsJson: input.attachmentsJson ?? "[]",
  });

  return response.data;
};

export const updateNote = async (note: Note) => {
  const response = await api.put<Note>(`/notes/${note.id}`, note);
  return response.data;
};

export const deleteNote = async (id: number) => {
  await api.delete(`/notes/${id}`);
};

export const createDocument = async (input: {
  title: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
}) => {
  const response = await api.post<DocumentAsset>("/documents", input);
  return response.data;
};

export const deleteDocument = async (id: number) => {
  await api.delete(`/documents/${id}`);
};


export const uploadAttachment = async (file: File, title?: string) => {
  const form = new FormData();

  form.append("title", title?.trim() || file.name);
  form.append("file", file);

  const response = await api.post(
    "/documents/upload",
    form,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

// The browser can't attach an Authorization header to a plain <img src> or
// <a href>/window.open request, so the token is passed as a query param and
// accepted as a fallback by JwtAuthenticationFilter on the backend.
const attachmentUrl = (id: number, inline: boolean) => {
  const token =
    localStorage.getItem("accessToken") ??
    localStorage.getItem("life-erp-token") ??
    "";

  const params = new URLSearchParams({ token });
  if (inline) {
    params.set("inline", "true");
  }

  return `${api.defaults.baseURL}/documents/${id}/download?${params.toString()}`;
};

// Opens the file in the browser's own viewer (PDF/image tabs render inline)
// instead of forcing a download.
export const previewAttachment = (id: number) => attachmentUrl(id, true);

// Forces a "Save As" download.
export const downloadAttachment = (id: number) => attachmentUrl(id, false);

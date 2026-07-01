export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueAt?: string;
  labels?: string;
  recurrence?: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  spentOn: string;
  paymentMethod: string;
  notes: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  goalType: "YEARLY" | "MONTHLY" | "WEEKLY";
  progress: number;
  targetDate?: string;
}


export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Attachment {
  id: number;
  title?: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface Note {
  id: number;

  title: string;
  body: string;

  format?: string;
  tags?: string;

  pinned: boolean;
  archived: boolean;
  favorite: boolean;

  color?: string;

  checklistJson?: string;
  attachmentsJson?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentAsset {
  id: number;
  title: string;
  documentType: string;
  fileName: string;
  storagePath?: string;
  contentType?: string;
  sizeBytes: number;
}

export interface EventItem {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  startsAt: string;
  endsAt?: string;
  reminderAt?: string;
  completed: boolean;
}

export interface DashboardData {
  todaysTasks: Task[];
  todaysExpenses: Expense[];
  upcomingEvents: EventItem[];
  goalProgress: Goal[];
  quickNotes: Note[];
  monthSpend: number;
  productivityScore: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Task {
  id: string;
  projectId: string;
  position: number | null;
  number: number | null;
  userId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: "no-priority" | "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  taskId: string;
  type:
    | "comment"
    | "task"
    | "status_changed"
    | "priority_changed"
    | "unassigned"
    | "assignee_changed"
    | "due_date_changed"
    | "title_changed"
    | "description_changed"
    | "create";
  createdAt: string;
  userId: string | null;
  content: string | null;
  externalUserName: string | null;
  externalUserAvatar: string | null;
  externalSource: string | null;
  externalUrl: string | null;
}

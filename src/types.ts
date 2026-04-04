export interface Project {
  id: string;
  workspaceId: string;
  slug: string;
  icon: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  isPublic: boolean | null;
  archivedAt: string | null;
}

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

export interface Column {
  id: string;
  name: string;
  position: number;
  projectId: string;
}

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

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  taskId: string | null;
  workspaceId: string | null;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export interface SearchResult {
  tasks: Task[];
  projects: Project[];
  workspaces: { id: string; name: string; slug: string }[];
  comments: Activity[];
  activities: Activity[];
}

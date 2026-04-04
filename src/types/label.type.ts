export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  taskId: string | null;
  workspaceId: string | null;
}

import type { Task } from "./task.type.js";
import type { Project } from "./project.type.js";
import type { Activity } from "./activity.type.js";

export interface SearchResult {
  tasks: Task[];
  projects: Project[];
  workspaces: { id: string; name: string; slug: string }[];
  comments: Activity[];
  activities: Activity[];
}

export type UserRole = "admin" | "manager" | "member";
export type Status = "todo" | "pending" | "in_progress" | "done" | "on_hold";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: Status;
  priority: number;
  managerId: number;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: Status;
  priority: number;
  assigneeId: number;
}

export interface Resource {
  id: number;
  projectId: number;
  taskId?: number;
  type: string;
  name: string;
  amount: number;
  unit?: string;
  notes?: string;
  createdAt: string;
}

export interface Report {
  id: number;
  projectId: number;
  type: string;
  content: string;
  createdBy: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface FileRecord {
  id: number;
  projectId: number;
  taskId?: number;
  path: string;
  originalName: string;
  uploadedBy: number;
  createdAt: string;
}

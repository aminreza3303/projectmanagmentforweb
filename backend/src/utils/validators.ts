import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager", "member"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const projectSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["todo", "pending", "in_progress", "done", "on_hold"]).optional(),
  priority: z.number().int().min(0).optional(),
  manager_id: z.number().int(),
  budget: z.number().min(0).optional(),
  resources: z.array(
    z.object({
      resourceItemId: z.number().int(),
      amount: z.number().min(0)
    })
  ).optional()
});

export const projectUpdateSchema = projectSchema.partial();

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  due_date: z.string().optional(),
  status: z.enum(["todo", "pending", "in_progress", "done", "on_hold"]).optional(),
  priority: z.number().int().min(0).optional(),
  cost: z.number().min(0).optional(),
  assignee_id: z.number().int()
});

export const taskUpdateSchema = taskSchema.partial();

const resourceBaseSchema = z.object({
  resourceItemId: z.number().int().optional(),
  type: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  amount: z.number().min(0),
  unit: z.string().optional(),
  notes: z.string().optional(),
  task_id: z.number().int().optional()
});

export const resourceSchema = resourceBaseSchema.refine(
  (data) => data.resourceItemId || (data.type && data.name),
  {
    message: "resourceItemId or name/type is required"
  }
);

export const resourceUpdateSchema = resourceBaseSchema.partial();

export const resourceCatalogSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  unit: z.string().optional()
});

export const reportSchema = z.object({
  project_id: z.number().int(),
  type: z.string().min(2),
  content: z.string().min(2)
});

export const notificationSchema = z.object({
  user_id: z.coerce.number().int(),
  title: z.string().min(2),
  body: z.string().min(2)
});

export const budgetIncreaseSchema = z.object({
  amount: z.coerce.number().min(0.01)
});

export const statusSchema = z.object({
  status: z.enum(["todo", "pending", "in_progress", "done", "on_hold"])
});

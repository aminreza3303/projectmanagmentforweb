const ex = {
  root: {
    name: "Project Management API",
    status: "ok",
    docs: "/docs",
    health: "/health"
  },
  health: { status: "ok" },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.payload.signature",
  registerRequest: {
    name: "Amin",
    email: "amin@example.com",
    password: "12345678",
    role: "manager"
  },
  loginRequest: {
    email: "admin@example.com",
    password: "12345678"
  },
  adminUser: {
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z"
  },
  managerUser: {
    id: 2,
    name: "Manager 1",
    email: "manager1@example.com",
    role: "manager",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z"
  },
  memberUser: {
    id: 6,
    name: "User 1",
    email: "user1@example.com",
    role: "member",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-02-20T10:00:00.000Z"
  },
  authResponse: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.payload.signature",
    user: {
      id: 1,
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
      createdAt: "2026-02-20T10:00:00.000Z",
      updatedAt: "2026-02-20T10:00:00.000Z"
    }
  },
  projectCreateRequest: {
    title: "Frontend Implementation",
    description: "Main implementation project",
    start_date: "2026-02-21",
    end_date: "2026-03-15",
    status: "pending",
    priority: 2,
    manager_id: 2,
    budget: 2500,
    resources: [
      { resourceItemId: 1, amount: 3 },
      { resourceItemId: 2, amount: 1 }
    ]
  },
  projectUpdateRequest: {
    title: "Frontend Implementation - Phase 2",
    end_date: "2026-03-20",
    priority: 3,
    budget: 3000,
    status: "in_progress"
  },
  project: {
    id: 1,
    title: "Frontend Implementation",
    description: "Main implementation project",
    startDate: "2026-02-21T00:00:00.000Z",
    endDate: "2026-03-15T00:00:00.000Z",
    status: "pending",
    priority: 2,
    budget: 2500,
    spent: 300,
    managerId: 2
  },
  addMemberRequest: { userId: 6 },
  projectMember: {
    id: 3,
    projectId: 1,
    userId: 6
  },
  taskCreateRequest: {
    title: "Implement dashboard cards",
    description: "Build KPI widgets and API integration",
    due_date: "2026-02-28",
    status: "pending",
    priority: 1,
    cost: 300,
    assignee_id: 6
  },
  taskUpdateRequest: {
    title: "Implement dashboard cards + tests",
    due_date: "2026-03-01",
    status: "in_progress",
    cost: 350,
    assignee_id: 6
  },
  statusRequest: { status: "done" },
  task: {
    id: 11,
    projectId: 1,
    title: "Implement dashboard cards",
    description: "Build KPI widgets and API integration",
    dueDate: "2026-02-28T00:00:00.000Z",
    status: "pending",
    priority: 1,
    cost: 300,
    assigneeId: 6
  },
  taskWithAssignee: {
    id: 11,
    projectId: 1,
    title: "Implement dashboard cards",
    description: "Build KPI widgets and API integration",
    dueDate: "2026-02-28T00:00:00.000Z",
    status: "pending",
    priority: 1,
    cost: 300,
    assigneeId: 6,
    assignee: {
      id: 6,
      name: "User 1",
      email: "user1@example.com"
    }
  },
  taskWithProject: {
    id: 11,
    projectId: 1,
    title: "Implement dashboard cards",
    description: "Build KPI widgets and API integration",
    dueDate: "2026-02-28T00:00:00.000Z",
    status: "pending",
    priority: 1,
    cost: 300,
    assigneeId: 6,
    project: {
      id: 1,
      title: "Frontend Implementation"
    }
  },
  resourceCatalogCreateRequest: {
    name: "Laptop",
    type: "equipment",
    unit: "pcs"
  },
  resourceItem: {
    id: 1,
    name: "Laptop",
    type: "equipment",
    unit: "pcs",
    createdAt: "2026-02-20T10:00:00.000Z"
  },
  projectResourceCreateRequest: {
    resourceItemId: 1,
    task_id: 11,
    amount: 2,
    unit: "pcs",
    notes: "Assigned for UI implementation"
  },
  resource: {
    id: 21,
    projectId: 1,
    taskId: 11,
    resourceItemId: 1,
    type: "equipment",
    name: "Laptop",
    amount: 2,
    unit: "pcs",
    notes: "Assigned for UI implementation",
    createdAt: "2026-02-20T10:00:00.000Z"
  },
  resourceWithRelations: {
    id: 21,
    projectId: 1,
    taskId: 11,
    resourceItemId: 1,
    type: "equipment",
    name: "Laptop",
    amount: 2,
    unit: "pcs",
    notes: "Assigned for UI implementation",
    createdAt: "2026-02-20T10:00:00.000Z",
    project: {
      id: 1,
      title: "Frontend Implementation"
    },
    task: {
      id: 11,
      title: "Implement dashboard cards",
      dueDate: "2026-02-28T00:00:00.000Z",
      status: "pending"
    },
    resourceItem: {
      id: 1,
      name: "Laptop",
      type: "equipment",
      unit: "pcs",
      createdAt: "2026-02-20T10:00:00.000Z"
    }
  },
  reportCreateRequest: {
    project_id: 1,
    type: "progress",
    content: "Sprint 2 is 80% complete"
  },
  report: {
    id: 31,
    projectId: 1,
    type: "progress",
    content: "Sprint 2 is 80% complete",
    createdBy: 2,
    createdAt: "2026-02-21T11:00:00.000Z"
  },
  reportWithProject: {
    id: 31,
    projectId: 1,
    type: "progress",
    content: "Sprint 2 is 80% complete",
    createdBy: 2,
    createdAt: "2026-02-21T11:00:00.000Z",
    project: {
      id: 1,
      title: "Frontend Implementation",
      managerId: 2
    }
  },
  reportSummary: {
    projects: 4,
    tasks: 22,
    tasksByStatus: {
      todo: 4,
      pending: 6,
      in_progress: 7,
      done: 5,
      on_hold: 0
    },
    budgetTotal: 9200,
    spentTotal: 4300
  },
  notificationCreateRequest: {
    user_id: 6,
    title: "Task updated",
    body: "Task #11 status changed to done."
  },
  notification: {
    id: 41,
    userId: 6,
    title: "Task updated",
    body: "Task #11 status changed to done.",
    readAt: null,
    createdAt: "2026-02-21T11:30:00.000Z"
  },
  activity: {
    id: 51,
    actorId: 2,
    projectId: 1,
    taskId: 11,
    action: "task.status_changed",
    message: "Task status changed: Implement dashboard cards -> done",
    metadata: "{\"to\":\"done\"}",
    createdAt: "2026-02-21T11:10:00.000Z"
  },
  activityWithRelations: {
    id: 51,
    actorId: 2,
    projectId: 1,
    taskId: 11,
    action: "task.status_changed",
    message: "Task status changed: Implement dashboard cards -> done",
    metadata: "{\"to\":\"done\"}",
    createdAt: "2026-02-21T11:10:00.000Z",
    actor: {
      id: 2,
      name: "Manager 1",
      email: "manager1@example.com"
    },
    project: {
      id: 1,
      title: "Frontend Implementation"
    },
    task: {
      id: 11,
      title: "Implement dashboard cards"
    }
  },
  fileRecord: {
    id: 61,
    projectId: 1,
    taskId: 11,
    path: "1708519600000-111222333-spec.pdf",
    originalName: "spec.pdf",
    uploadedBy: 2,
    createdAt: "2026-02-21T11:40:00.000Z"
  },
  fileWithRelations: {
    id: 61,
    projectId: 1,
    taskId: 11,
    path: "1708519600000-111222333-spec.pdf",
    originalName: "spec.pdf",
    uploadedBy: 2,
    createdAt: "2026-02-21T11:40:00.000Z",
    uploader: {
      id: 2,
      name: "Manager 1",
      email: "manager1@example.com"
    },
    task: {
      id: 11,
      title: "Implement dashboard cards"
    }
  },
  budgetIncreaseRequest: { amount: 1000 },
  budgetDecreaseRequest: { amount: 500 },
  budget: {
    id: 1,
    total: 10000,
    allocated: 5500,
    available: 4500
  },
  messageDeleted: { message: "Deleted" },
  messageRemoved: { message: "Removed" },
  messageLoggedOut: { message: "Logged out" },
  validationError: {
    message: "Validation error",
    issues: [
      {
        code: "too_small",
        minimum: 2,
        type: "string",
        inclusive: true,
        exact: false,
        message: "String must contain at least 2 character(s)",
        path: ["title"]
      }
    ]
  },
  forbiddenError: { message: "Forbidden" },
  unauthorizedError: { message: "Unauthorized" },
  notFoundError: { message: "Project not found" },
  conflictError: { message: "Email already registered" }
} as const;

export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Project Management API",
    version: "1.2.0",
    description:
      "Backend API for project, task, resource, report, notification, file, and budget management."
  },
  servers: [{ url: "http://localhost:4000" }],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Projects" },
    { name: "Tasks" },
    { name: "Resources" },
    { name: "Reports" },
    { name: "Notifications" },
    { name: "Files" },
    { name: "Budget" }
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          issues: { type: "array", items: { type: "object", additionalProperties: true } }
        }
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      },
      UserSafe: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["admin", "manager", "member"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          startDate: { type: "string", format: "date-time", nullable: true },
          endDate: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer" },
          budget: { type: "number" },
          spent: { type: "number" },
          managerId: { type: "integer" }
        }
      },
      ProjectMember: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          userId: { type: "integer" }
        }
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          dueDate: { type: "string", format: "date-time", nullable: true },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer" },
          cost: { type: "number" },
          assigneeId: { type: "integer" }
        }
      },
      TaskWithAssignee: {
        allOf: [
          { $ref: "#/components/schemas/Task" },
          {
            type: "object",
            properties: {
              assignee: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" }
                }
              }
            }
          }
        ]
      },
      TaskWithProject: {
        allOf: [
          { $ref: "#/components/schemas/Task" },
          {
            type: "object",
            properties: {
              project: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" }
                }
              }
            }
          }
        ]
      },
      ResourceItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          type: { type: "string" },
          unit: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Resource: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          taskId: { type: "integer", nullable: true },
          resourceItemId: { type: "integer", nullable: true },
          type: { type: "string", nullable: true },
          name: { type: "string", nullable: true },
          amount: { type: "number" },
          unit: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      ResourceWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/Resource" },
          {
            type: "object",
            properties: {
              project: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" }
                }
              },
              task: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  dueDate: { type: "string", format: "date-time", nullable: true },
                  status: { type: "string" }
                }
              },
              resourceItem: { $ref: "#/components/schemas/ResourceItem" }
            }
          }
        ]
      },
      Report: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          type: { type: "string" },
          content: { type: "string" },
          createdBy: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      ReportWithProject: {
        allOf: [
          { $ref: "#/components/schemas/Report" },
          {
            type: "object",
            properties: {
              project: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" },
                  managerId: { type: "integer" }
                }
              }
            }
          }
        ]
      },
      ReportSummary: {
        type: "object",
        properties: {
          projects: { type: "integer" },
          tasks: { type: "integer" },
          tasksByStatus: {
            type: "object",
            properties: {
              todo: { type: "integer" },
              pending: { type: "integer" },
              in_progress: { type: "integer" },
              done: { type: "integer" },
              on_hold: { type: "integer" }
            }
          },
          budgetTotal: { type: "number" },
          spentTotal: { type: "number" }
        }
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          title: { type: "string" },
          body: { type: "string" },
          readAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Activity: {
        type: "object",
        properties: {
          id: { type: "integer" },
          actorId: { type: "integer", nullable: true },
          projectId: { type: "integer", nullable: true },
          taskId: { type: "integer", nullable: true },
          action: { type: "string" },
          message: { type: "string" },
          metadata: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      ActivityWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/Activity" },
          {
            type: "object",
            properties: {
              actor: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" }
                }
              },
              project: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" }
                }
              },
              task: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" }
                }
              }
            }
          }
        ]
      },
      FileRecord: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          taskId: { type: "integer", nullable: true },
          path: { type: "string" },
          originalName: { type: "string" },
          uploadedBy: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      FileWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/FileRecord" },
          {
            type: "object",
            properties: {
              uploader: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" }
                }
              },
              task: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  title: { type: "string" }
                }
              }
            }
          }
        ]
      },
      GlobalBudget: {
        type: "object",
        properties: {
          id: { type: "integer" },
          total: { type: "number" },
          allocated: { type: "number" },
          available: { type: "number" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/UserSafe" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 }
        }
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["admin", "manager", "member"] }
        }
      },
      StatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["todo", "pending", "in_progress", "done", "on_hold"]
          }
        }
      },
      AddMemberRequest: {
        type: "object",
        required: ["userId"],
        properties: {
          userId: { type: "integer" }
        }
      },
      ProjectCreateRequest: {
        type: "object",
        required: ["title", "manager_id"],
        properties: {
          title: { type: "string", minLength: 2 },
          description: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer", minimum: 0 },
          manager_id: { type: "integer" },
          budget: { type: "number", minimum: 0 },
          resources: {
            type: "array",
            items: {
              type: "object",
              required: ["resourceItemId", "amount"],
              properties: {
                resourceItemId: { type: "integer" },
                amount: { type: "number", minimum: 0 }
              }
            }
          }
        }
      },
      ProjectUpdateRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 2 },
          description: { type: "string" },
          start_date: { type: "string", format: "date" },
          end_date: { type: "string", format: "date" },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer", minimum: 0 },
          manager_id: { type: "integer" },
          budget: { type: "number", minimum: 0 }
        }
      },
      TaskCreateRequest: {
        type: "object",
        required: ["title", "assignee_id"],
        properties: {
          title: { type: "string", minLength: 2 },
          description: { type: "string" },
          due_date: { type: "string", format: "date" },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer", minimum: 0 },
          cost: { type: "number", minimum: 0 },
          assignee_id: { type: "integer" }
        }
      },
      TaskUpdateRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 2 },
          description: { type: "string" },
          due_date: { type: "string", format: "date" },
          status: { type: "string", enum: ["todo", "pending", "in_progress", "done", "on_hold"] },
          priority: { type: "integer", minimum: 0 },
          cost: { type: "number", minimum: 0 },
          assignee_id: { type: "integer" }
        }
      },
      ResourceCatalogCreateRequest: {
        type: "object",
        required: ["name", "type"],
        properties: {
          name: { type: "string", minLength: 2 },
          type: { type: "string", minLength: 2 },
          unit: { type: "string" }
        }
      },
      ProjectResourceCreateRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          resourceItemId: { type: "integer" },
          type: { type: "string" },
          name: { type: "string" },
          amount: { type: "number", minimum: 0 },
          unit: { type: "string" },
          notes: { type: "string" },
          task_id: { type: "integer" }
        }
      },
      ReportCreateRequest: {
        type: "object",
        required: ["project_id", "type", "content"],
        properties: {
          project_id: { type: "integer" },
          type: { type: "string", minLength: 2 },
          content: { type: "string", minLength: 2 }
        }
      },
      NotificationCreateRequest: {
        type: "object",
        required: ["user_id", "title", "body"],
        properties: {
          user_id: { type: "integer" },
          title: { type: "string", minLength: 2 },
          body: { type: "string", minLength: 2 }
        }
      },
      BudgetIncreaseRequest: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "integer", minimum: 1, maximum: 1000000 }
        }
      }
    }
  },
  paths: {
    "/": {
      get: {
        tags: ["System"],
        security: [],
        summary: "Root endpoint",
        responses: {
          "200": {
            description: "API metadata",
            content: {
              "application/json": {
                schema: { type: "object" },
                example: ex.root
              }
            }
          }
        }
      }
    },
    "/health": {
      get: {
        tags: ["System"],
        security: [],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { type: "object" },
                example: ex.health
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: ex.registerRequest
            }
          }
        },
        responses: {
          "201": {
            description: "User created with JWT token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
                example: ex.authResponse
              }
            }
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.conflictError
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: ex.loginRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Login successful (token + user)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
                example: ex.authResponse
              }
            }
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Invalid credentials" }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user (stateless response)",
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageLoggedOut
              }
            }
          }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSafe" },
                example: ex.adminUser
              }
            }
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.unauthorizedError
              }
            }
          }
        }
      }
    },
    "/api/users/managers": {
      get: {
        tags: ["Users"],
        summary: "List managers",
        responses: {
          "200": {
            description: "Managers list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserSafe" } },
                example: [ex.managerUser]
              }
            }
          }
        }
      }
    },
    "/api/users/assignable": {
      get: {
        tags: ["Users"],
        summary: "List assignable users",
        responses: {
          "200": {
            description: "Users list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserSafe" } },
                example: [ex.adminUser, ex.managerUser, ex.memberUser]
              }
            }
          }
        }
      }
    },
    "/api/users/me/tasks": {
      get: {
        tags: ["Users"],
        summary: "Get tasks assigned to current user",
        responses: {
          "200": {
            description: "Task list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TaskWithProject" } },
                example: [ex.taskWithProject]
              }
            }
          }
        }
      }
    },
    "/api/users/me/resources": {
      get: {
        tags: ["Users"],
        summary: "Get resources linked to current user tasks",
        responses: {
          "200": {
            description: "Resource list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ResourceWithRelations" }
                },
                example: [ex.resourceWithRelations]
              }
            }
          }
        }
      }
    },
    "/api/users/me/activity": {
      get: {
        tags: ["Users"],
        summary: "Get activity stream related to current user",
        parameters: [
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 200 },
            required: false,
            example: 50
          }
        ],
        responses: {
          "200": {
            description: "Activity list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ActivityWithRelations" }
                },
                example: [ex.activityWithRelations]
              }
            }
          }
        }
      }
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (admin)",
        responses: {
          "200": {
            description: "Users list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserSafe" } },
                example: [ex.adminUser, ex.managerUser, ex.memberUser]
              }
            }
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Create user (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: ex.registerRequest
            }
          }
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSafe" },
                example: ex.memberUser
              }
            }
          },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.conflictError
              }
            }
          }
        }
      }
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by id (admin)",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 6 }],
        responses: {
          "200": {
            description: "User",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSafe" },
                example: ex.memberUser
              }
            }
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "User not found" }
              }
            }
          }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Update user by id (admin)",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 6 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "User 1 Updated",
                email: "user1@example.com",
                password: "12345678",
                role: "member"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserSafe" },
                example: { ...ex.memberUser, name: "User 1 Updated" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user by id (admin)",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 6 }],
        responses: {
          "200": {
            description: "User deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageDeleted
              }
            }
          }
        }
      }
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects",
        parameters: [
          { in: "query", name: "status", schema: { type: "string" }, required: false, example: "pending" },
          { in: "query", name: "priority", schema: { type: "integer" }, required: false, example: 2 },
          { in: "query", name: "q", schema: { type: "string" }, required: false, example: "Frontend" }
        ],
        responses: {
          "200": {
            description: "Project list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Project" } },
                example: [ex.project]
              }
            }
          }
        }
      },
      post: {
        tags: ["Projects"],
        summary: "Create project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectCreateRequest" },
              example: ex.projectCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Project created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
                example: ex.project
              }
            }
          },
          "400": {
            description: "Invalid input / business rule violation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.validationError
              }
            }
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.forbiddenError
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get project details",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          "200": {
            description: "Project",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
                example: ex.project
              }
            }
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: ex.notFoundError
              }
            }
          }
        }
      },
      put: {
        tags: ["Projects"],
        summary: "Update project",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectUpdateRequest" },
              example: ex.projectUpdateRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Project updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
                example: {
                  ...ex.project,
                  title: "Frontend Implementation - Phase 2",
                  endDate: "2026-03-20T00:00:00.000Z",
                  priority: 3,
                  budget: 3000,
                  status: "in_progress"
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete project",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          "200": {
            description: "Project deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageDeleted
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/status": {
      patch: {
        tags: ["Projects"],
        summary: "Update project status",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusRequest" },
              example: ex.statusRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
                example: { ...ex.project, status: "done" }
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/members": {
      get: {
        tags: ["Projects"],
        summary: "Get project members",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          "200": {
            description: "Member list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserSafe" } },
                example: [ex.memberUser]
              }
            }
          }
        }
      },
      post: {
        tags: ["Projects"],
        summary: "Add project member",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddMemberRequest" },
              example: ex.addMemberRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Member added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectMember" },
                example: ex.projectMember
              }
            }
          },
          "409": {
            description: "Already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Member already added" }
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/members/{userId}": {
      delete: {
        tags: ["Projects"],
        summary: "Remove project member",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 },
          { in: "path", name: "userId", required: true, schema: { type: "integer" }, example: 6 }
        ],
        responses: {
          "200": {
            description: "Member removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageRemoved
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/files": {
      get: {
        tags: ["Projects"],
        summary: "List project files",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          "200": {
            description: "Files list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/FileWithRelations" } },
                example: [ex.fileWithRelations]
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/activity": {
      get: {
        tags: ["Projects"],
        summary: "Get project activity log",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 },
          { in: "query", name: "limit", required: false, schema: { type: "integer" }, example: 50 }
        ],
        responses: {
          "200": {
            description: "Activity list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ActivityWithRelations" }
                },
                example: [ex.activityWithRelations]
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks by project",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 },
          { in: "query", name: "status", required: false, schema: { type: "string" }, example: "pending" },
          { in: "query", name: "assigneeId", required: false, schema: { type: "integer" }, example: 6 },
          { in: "query", name: "q", required: false, schema: { type: "string" }, example: "dashboard" }
        ],
        responses: {
          "200": {
            description: "Task list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/TaskWithAssignee" } },
                example: [ex.taskWithAssignee]
              }
            }
          }
        }
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task in project",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskCreateRequest" },
              example: ex.taskCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
                example: ex.task
              }
            }
          }
        }
      }
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task details",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 11 }],
        responses: {
          "200": {
            description: "Task",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskWithAssignee" },
                example: ex.taskWithAssignee
              }
            }
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Task not found" }
              }
            }
          }
        }
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 11 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdateRequest" },
              example: ex.taskUpdateRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Task updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
                example: {
                  ...ex.task,
                  title: "Implement dashboard cards + tests",
                  dueDate: "2026-03-01T00:00:00.000Z",
                  status: "in_progress",
                  cost: 350
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 11 }],
        responses: {
          "200": {
            description: "Task deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageDeleted
              }
            }
          }
        }
      }
    },
    "/api/tasks/{id}/status": {
      patch: {
        tags: ["Tasks"],
        summary: "Update task status",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 11 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusRequest" },
              example: ex.statusRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
                example: { ...ex.task, status: "done" }
              }
            }
          }
        }
      }
    },
    "/api/resources": {
      get: {
        tags: ["Resources"],
        summary: "List all resources",
        responses: {
          "200": {
            description: "Resource list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ResourceWithRelations" }
                },
                example: [ex.resourceWithRelations]
              }
            }
          }
        }
      }
    },
    "/api/resources/catalog": {
      get: {
        tags: ["Resources"],
        summary: "List resource catalog items",
        responses: {
          "200": {
            description: "Catalog list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/ResourceItem" } },
                example: [ex.resourceItem]
              }
            }
          }
        }
      },
      post: {
        tags: ["Resources"],
        summary: "Create resource catalog item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResourceCatalogCreateRequest" },
              example: ex.resourceCatalogCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Catalog item created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResourceItem" },
                example: ex.resourceItem
              }
            }
          }
        }
      }
    },
    "/api/projects/{id}/resources": {
      get: {
        tags: ["Resources"],
        summary: "List project resources",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        responses: {
          "200": {
            description: "Resource list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ResourceWithRelations" }
                },
                example: [ex.resourceWithRelations]
              }
            }
          }
        }
      },
      post: {
        tags: ["Resources"],
        summary: "Create project resource",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectResourceCreateRequest" },
              example: ex.projectResourceCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Resource created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Resource" },
                example: ex.resource
              }
            }
          }
        }
      }
    },
    "/api/resources/{id}": {
      put: {
        tags: ["Resources"],
        summary: "Update resource",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 21 }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProjectResourceCreateRequest" },
              example: { ...ex.projectResourceCreateRequest, amount: 3 }
            }
          }
        },
        responses: {
          "200": {
            description: "Resource updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Resource" },
                example: { ...ex.resource, amount: 3 }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Resources"],
        summary: "Delete resource",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 21 }],
        responses: {
          "200": {
            description: "Resource deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageDeleted
              }
            }
          }
        }
      }
    },
    "/api/reports": {
      get: {
        tags: ["Reports"],
        summary: "List reports",
        parameters: [
          { in: "query", name: "projectId", required: false, schema: { type: "integer" }, example: 1 }
        ],
        responses: {
          "200": {
            description: "Reports list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Report" } },
                example: [ex.report]
              }
            }
          }
        }
      },
      post: {
        tags: ["Reports"],
        summary: "Create report",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReportCreateRequest" },
              example: ex.reportCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Report created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
                example: ex.report
              }
            }
          }
        }
      }
    },
    "/api/reports/summary": {
      get: {
        tags: ["Reports"],
        summary: "Get reports summary metrics",
        responses: {
          "200": {
            description: "Summary metrics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReportSummary" },
                example: ex.reportSummary
              }
            }
          }
        }
      }
    },
    "/api/reports/{id}": {
      get: {
        tags: ["Reports"],
        summary: "Get report details",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 31 }],
        responses: {
          "200": {
            description: "Report",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReportWithProject" },
                example: ex.reportWithProject
              }
            }
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Report not found" }
              }
            }
          }
        }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get current user notifications",
        responses: {
          "200": {
            description: "Notifications list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
                example: [ex.notification]
              }
            }
          }
        }
      },
      post: {
        tags: ["Notifications"],
        summary: "Send notification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NotificationCreateRequest" },
              example: ex.notificationCreateRequest
            }
          }
        },
        responses: {
          "201": {
            description: "Notification created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Notification" },
                example: ex.notification
              }
            }
          }
        }
      }
    },
    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 41 }],
        responses: {
          "200": {
            description: "Notification updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Notification" },
                example: {
                  ...ex.notification,
                  readAt: "2026-02-21T12:00:00.000Z"
                }
              }
            }
          }
        }
      }
    },
    "/api/files": {
      post: {
        tags: ["Files"],
        summary: "Upload file",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "projectId"],
                properties: {
                  file: { type: "string", format: "binary" },
                  projectId: { type: "string" },
                  taskId: { type: "string" }
                }
              },
              example: {
                projectId: "1",
                taskId: "11",
                file: "(binary)"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "File uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FileRecord" },
                example: ex.fileRecord
              }
            }
          }
        }
      }
    },
    "/api/files/{id}": {
      get: {
        tags: ["Files"],
        summary: "Download file",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 61 }],
        responses: {
          "200": {
            description: "Binary file response",
            content: {
              "application/octet-stream": {
                schema: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Files"],
        summary: "Delete file",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" }, example: 61 }],
        responses: {
          "200": {
            description: "File deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: ex.messageDeleted
              }
            }
          }
        }
      }
    },
    "/api/budget": {
      get: {
        tags: ["Budget"],
        summary: "Get global budget",
        responses: {
          "200": {
            description: "Budget snapshot",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GlobalBudget" },
                example: ex.budget
              }
            }
          }
        }
      }
    },
    "/api/budget/increase": {
      post: {
        tags: ["Budget"],
        summary: "Increase global budget (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BudgetIncreaseRequest" },
              example: ex.budgetIncreaseRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Budget updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GlobalBudget" },
                example: {
                  id: 1,
                  total: 11000,
                  allocated: 5500,
                  available: 5500
                }
              }
            }
          }
        }
      }
    },
    "/api/budget/decrease": {
      post: {
        tags: ["Budget"],
        summary: "Decrease global budget (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BudgetIncreaseRequest" },
              example: ex.budgetDecreaseRequest
            }
          }
        },
        responses: {
          "200": {
            description: "Budget updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GlobalBudget" },
                example: {
                  id: 1,
                  total: 10500,
                  allocated: 5500,
                  available: 5000
                }
              }
            }
          },
          "400": {
            description: "Cannot decrease below allocated budget",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: {
                  message: "Cannot decrease budget by 6000. Maximum removable amount is 5000."
                }
              }
            }
          }
        }
      }
    }
  }
} as const;

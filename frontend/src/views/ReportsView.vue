<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="mb-1">Reports</h2>
        <div class="text-muted small">گزارش پیشرفت و مالی با امکان انتخاب چند پروژه</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="selectAll">انتخاب همه</button>
        <button class="btn btn-outline-secondary" @click="reload">تازه‌سازی</button>
      </div>
    </div>

    <div class="card-plain mb-3">
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <label class="form-label small text-muted">پروژه‌ها (انتخاب چندتایی)</label>
          <select
            v-model="selectedProjectIds"
            class="form-select"
            multiple
            size="6"
            @change="handleSelectionChange"
          >
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.title }} ({{ p.id }})
            </option>
          </select>
          <div class="text-muted small mt-1">اگر هیچ موردی را انتخاب نکنید، همه پروژه‌ها لحاظ می‌شود.</div>
        </div>
        <div class="col-md-6">
          <div class="text-muted small mb-1">پروژه‌های فعال در گزارش</div>
          <div class="d-flex flex-wrap gap-2">
            <span v-for="p in activeProjects" :key="p.id" class="chip">
              {{ p.title }}
              <button type="button" class="chip-close" @click="removeSelection(p.id)">×</button>
            </span>
            <span v-if="!activeProjects.length" class="text-muted small">پروژه‌ای در دسترس نیست.</span>
          </div>
        </div>
      </div>
      <div v-if="loading" class="text-muted small mt-2">در حال بارگذاری داده‌های پروژه...</div>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">پروژه‌های انتخاب‌شده</div>
          <div class="stat-value">{{ activeProjects.length }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">تسک‌ها</div>
          <div class="stat-value">{{ tasksDone }} / {{ tasksTotal }}</div>
          <div class="text-muted small">تسک انجام‌شده / کل</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">درصد پیشرفت</div>
          <div class="stat-value">{{ progressPercent }}%</div>
          <div class="progress-track mt-1">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-label">بودجه مصرف‌شده</div>
          <div class="stat-value">{{ spentTotal }} / {{ budgetTotal }}</div>
          <div class="progress-track mt-1">
            <div class="progress-fill bg-success" :style="{ width: `${budgetUsedPercent}%` }"></div>
          </div>
          <div class="text-muted small">{{ budgetUsedPercent }}% مصرف بودجه</div>
        </div>
      </div>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>پیشرفت تسک‌ها بر اساس وضعیت</strong>
        <span class="text-muted small">نمای کلی از پروژه‌های انتخاب‌شده</span>
      </div>
      <div class="status-bars">
        <div v-for="status in statuses" :key="status" class="status-row">
          <div class="d-flex justify-content-between">
            <span>{{ statusLabels[status] }}</span>
            <span class="text-muted small">{{ tasksByStatus[status] }}</span>
          </div>
          <div class="progress-track mt-1">
            <div
              class="progress-fill"
              :style="{ width: barWidth(tasksByStatus[status], tasksTotal) }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>نمای تفکیکی پروژه‌ها</strong>
        <span class="text-muted small">ترکیب پیشرفت و مالی</span>
      </div>
      <div class="table-responsive">
        <table class="table-lite">
          <thead>
            <tr>
              <th>پروژه</th>
              <th>وضعیت</th>
              <th>تسک‌های انجام‌شده</th>
              <th>درصد پیشرفت</th>
              <th>بودجه / خرج‌شده</th>
              <th>% مصرف بودجه</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in projectRows" :key="row.id">
              <td>{{ row.title }}</td>
              <td><span class="badge" :class="statusClass(row.status)">{{ row.status }}</span></td>
              <td>{{ row.done }} / {{ row.total }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <span>{{ row.progress }}%</span>
                  <div class="progress-track flex-grow-1" style="max-width: 140px;">
                    <div class="progress-fill" :style="{ width: `${row.progress}%` }"></div>
                  </div>
                </div>
              </td>
              <td>{{ row.spent }} / {{ row.budget }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <span>{{ row.budgetPct }}%</span>
                  <div class="progress-track flex-grow-1" style="max-width: 140px;">
                    <div class="progress-fill bg-success" :style="{ width: `${row.budgetPct}%` }"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!projectRows.length">
              <td colspan="6" class="text-muted small">داده‌ای برای نمایش وجود ندارد.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>گزارش مالی و منابع</strong>
        <span class="text-muted small">جمع منابع مصرف‌شده در پروژه‌های انتخابی</span>
      </div>
      <div class="row g-3">
        <div class="col-md-7">
          <div class="table-responsive">
            <table class="table-lite">
              <thead>
                <tr>
                  <th>منبع</th>
                  <th>نوع</th>
                  <th>مقدار کل</th>
                  <th>واحد</th>
                  <th>تعداد پروژه‌ها</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in resourceSummary" :key="r.key">
                  <td>{{ r.name }}</td>
                  <td>{{ r.type || "-" }}</td>
                  <td>{{ r.amount }}</td>
                  <td>{{ r.unit || "-" }}</td>
                  <td>{{ r.projects }}</td>
                </tr>
                <tr v-if="!resourceSummary.length">
                  <td colspan="5" class="text-muted small">منبعی ثبت نشده است.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-md-5">
          <div class="stat-card h-100">
            <div class="stat-label">بودجه کل انتخاب‌شده</div>
            <div class="stat-value">{{ budgetTotal }}</div>
            <div class="text-muted small mb-2">تجمیع بودجه پروژه‌ها</div>

            <div class="stat-label">خرج‌شده</div>
            <div class="stat-value">{{ spentTotal }}</div>
            <div class="progress-track mt-1">
              <div class="progress-fill bg-success" :style="{ width: `${budgetUsedPercent}%` }"></div>
            </div>
            <div class="text-muted small">{{ budgetUsedPercent }}% مصرف بودجه</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="canManageReports" class="card-plain mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>ثبت گزارش متنی</strong>
        <span class="text-muted small">برای آرشیو یا اشتراک‌گذاری</span>
      </div>
      <form @submit.prevent="createReport">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label small text-muted">پروژه</label>
            <select v-model="form.project_id" class="form-select" required>
              <option disabled value="">انتخاب پروژه</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }} ({{ p.id }})</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted">نوع گزارش</label>
            <input v-model="form.type" class="form-control" placeholder="مثلا progress/finance" required />
          </div>
          <div class="col-md-6">
            <label class="form-label small text-muted">شرح کوتاه</label>
            <input v-model="form.content" class="form-control" placeholder="خلاصه گزارش" required />
          </div>
        </div>
        <button class="btn btn-outline-secondary mt-2">ثبت گزارش</button>
      </form>
      <div v-if="error" class="text-danger small mt-2">{{ error }}</div>
    </div>

    <div class="card-plain">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <strong>گزارش‌های ثبت‌شده</strong>
        <span class="text-muted small">آخرین گزارش‌ها</span>
      </div>
      <div class="table-responsive">
        <table class="table-lite">
          <thead>
            <tr>
              <th>پروژه</th>
              <th>نوع</th>
              <th>متن</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reports" :key="r.id">
              <td>{{ r.projectId }}</td>
              <td>{{ r.type }}</td>
              <td>{{ r.content }}</td>
            </tr>
            <tr v-if="!reports.length">
              <td colspan="3" class="text-muted small">گزارشی ثبت نشده است.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const projects = ref([]);
const tasksByProject = reactive({});
const resourcesByProject = reactive({});
const selectedProjectIds = ref([]);
const reports = ref([]);
const loading = ref(false);
const error = ref("");
const form = reactive({ project_id: "", type: "progress", content: "" });
const auth = useAuthStore();
const canManageReports = computed(
  () => auth.user?.role === "admin" || auth.user?.role === "manager"
);

const statuses = ["todo", "pending", "in_progress", "done", "on_hold"];
const statusLabels = {
  todo: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold"
};

const activeProjectIds = computed(() =>
  selectedProjectIds.value.length ? selectedProjectIds.value : projects.value.map((p) => p.id)
);

const activeProjects = computed(() =>
  projects.value.filter((p) => activeProjectIds.value.includes(p.id))
);

const allTasks = computed(() =>
  activeProjectIds.value.flatMap((id) => tasksByProject[id] || [])
);

const tasksByStatus = computed(() =>
  statuses.reduce((acc, status) => {
    acc[status] = allTasks.value.filter((t) => t.status === status).length;
    return acc;
  }, {})
);

const tasksTotal = computed(() => allTasks.value.length);
const tasksDone = computed(() => tasksByStatus.value.done || 0);
const progressPercent = computed(() =>
  tasksTotal.value ? Math.round((tasksDone.value / tasksTotal.value) * 100) : 0
);

const budgetTotal = computed(() =>
  activeProjects.value.reduce((sum, p) => sum + (p.budget || 0), 0)
);
const spentTotal = computed(() =>
  activeProjects.value.reduce((sum, p) => sum + (p.spent || 0), 0)
);
const budgetUsedPercent = computed(() =>
  budgetTotal.value ? Math.min(100, Math.round((spentTotal.value / budgetTotal.value) * 100)) : 0
);

const projectRows = computed(() =>
  activeProjects.value.map((p) => {
    const tasks = tasksByProject[p.id] || [];
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const progress = total ? Math.round((done / total) * 100) : 0;
    const budget = p.budget || 0;
    const spent = p.spent || 0;
    const budgetPct = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      total,
      done,
      progress,
      budget,
      spent,
      budgetPct
    };
  })
);

const resourceSummary = computed(() => {
  const map = new Map();
  activeProjectIds.value.forEach((id) => {
    const items = resourcesByProject[id] || [];
    items.forEach((r) => {
      const key = `${r.name || "Resource"}|${r.unit || ""}`;
      const current = map.get(key) || {
        key,
        name: r.name || "Resource",
        unit: r.unit || "",
        type: r.type || "",
        amount: 0,
        projectsSet: new Set()
      };
      current.amount += Number(r.amount) || 0;
      current.projectsSet.add(id);
      map.set(key, current);
    });
  });
  return Array.from(map.values()).map((item) => ({
    key: item.key,
    name: item.name,
    unit: item.unit,
    type: item.type,
    amount: item.amount,
    projects: item.projectsSet.size
  }));
});

const statusClass = (status) =>
  ({
    todo: "bg-secondary",
    pending: "bg-warning text-dark",
    in_progress: "bg-primary",
    done: "bg-success",
    on_hold: "bg-dark"
  }[status] || "bg-secondary");

const barWidth = (count, total) => {
  if (!total || !count) return "0%";
  return `${Math.min(100, Math.round((count / total) * 100))}%`;
};

const removeSelection = (id) => {
  selectedProjectIds.value = selectedProjectIds.value.filter((pId) => pId !== id);
};

const selectAll = () => {
  selectedProjectIds.value = [];
  handleSelectionChange();
};

const handleSelectionChange = () => {
  loadSelectionData();
};

const loadProjects = async () => {
  error.value = "";
  try {
    const { data } = await api.get("/api/projects");
    projects.value = data;
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load projects";
  }
};

const loadSelectionData = async () => {
  if (!activeProjectIds.value.length) return;
  loading.value = true;
  error.value = "";
  const ids = [...activeProjectIds.value];
  try {
    const [taskResults, resourceResults] = await Promise.all([
      Promise.all(
        ids.map(async (id) => {
          try {
            const { data } = await api.get(`/api/projects/${id}/tasks`);
            return { id, data };
          } catch (err) {
            return { id, data: [] };
          }
        })
      ),
      Promise.all(
        ids.map(async (id) => {
          try {
            const { data } = await api.get(`/api/projects/${id}/resources`);
            return { id, data };
          } catch (err) {
            return { id, data: [] };
          }
        })
      )
    ]);

    taskResults.forEach(({ id, data }) => {
      tasksByProject[id] = data;
    });
    resourceResults.forEach(({ id, data }) => {
      resourcesByProject[id] = data;
    });
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to load project data";
  } finally {
    loading.value = false;
  }
};

const loadReports = async () => {
  try {
    const { data } = await api.get("/api/reports");
    reports.value = data;
  } catch (err) {
    // optional: keep silent, main data already loaded
  }
};

const createReport = async () => {
  error.value = "";
  try {
    await api.post("/api/reports", {
      project_id: Number(form.project_id),
      type: form.type,
      content: form.content
    });
    form.content = "";
    await loadReports();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to create report";
  }
};

const reload = async () => {
  await loadProjects();
  await loadSelectionData();
  await loadReports();
};

onMounted(async () => {
  await loadProjects();
  await loadSelectionData();
  await loadReports();
});
</script>

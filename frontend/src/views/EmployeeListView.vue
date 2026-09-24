<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { apiFetch } from '../api/http';

type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

interface EmployeeListItem {
  employeeNo: string;
  name: string;
  email: string | null;
  department: string | null;
  jobTitle: string | null;
  status: EmployeeStatus;
  hireDate: string;
}

interface EmployeeListResponse {
  data: EmployeeListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const router = useRouter();

const employees = ref<EmployeeListItem[]>([]);
const loading = ref(false);

const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const role = localStorage.getItem('role');
const isAdmin = role === 'admin';

const searchForm = ref({
  name: '',
  email: '',
  department: '',
  jobTitle: '',
  status: '',
});

const dialogVisible = ref(false);
const creating = ref(false);

const createForm = ref({
  name: '',
  nationalId: '',
  email: '',
  department: '',
  jobTitle: '',
  status: 'ACTIVE' as EmployeeStatus,
  hireDate: '',
});

function logout() {
  clearAuth();
  router.replace('/login');
}

function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
}

async function fetchEmployees() {
  loading.value = true;

  try {
    const params = new URLSearchParams();

    if (searchForm.value.name.trim()) {
      params.set('name', searchForm.value.name.trim());
    }

    if (searchForm.value.email.trim()) {
      params.set('email', searchForm.value.email.trim());
    }

    if (searchForm.value.department.trim()) {
      params.set('department', searchForm.value.department.trim());
    }

    if (searchForm.value.jobTitle.trim()) {
      params.set('jobTitle', searchForm.value.jobTitle.trim());
    }

    if (searchForm.value.status) {
      params.set('status', searchForm.value.status);
    }

    params.set('page', String(page.value));
    params.set('pageSize', String(pageSize.value));

    const response = await apiFetch(`/employees?${params.toString()}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join('、')
          : result.message,
      );
    }

    const data = result as EmployeeListResponse;

    employees.value = data.data;
    total.value = data.pagination.total;
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : '員工資料讀取失敗',
    );
  } finally {
    loading.value = false;
  }
}

function searchEmployees() {
  page.value = 1;
  fetchEmployees();
}

function resetSearch() {
  searchForm.value = {
    name: '',
    email: '',
    department: '',
    jobTitle: '',
    status: '',
  };

  page.value = 1;

  fetchEmployees();
}

function openCreateDialog() {
  resetCreateForm();
  dialogVisible.value = true;
}

function resetCreateForm() {
  createForm.value = {
    name: '',
    nationalId: '',
    email: '',
    department: '',
    jobTitle: '',
    status: 'ACTIVE',
    hireDate: '',
  };
}

async function createEmployee() {
  if (
    !createForm.value.name.trim() ||
    !createForm.value.nationalId.trim() ||
    !createForm.value.hireDate
  ) {
    ElMessage.warning('姓名、身分證字號、到職日為必填');
    return;
  }

  creating.value = true;

  try {
    const payload: Record<string, string> = {
      name: createForm.value.name.trim(),
      nationalId: createForm.value.nationalId.trim().toUpperCase(),
      hireDate: createForm.value.hireDate,
      status: createForm.value.status,
    };

    if (createForm.value.email.trim()) {
      payload.email = createForm.value.email.trim();
    }

    if (createForm.value.department.trim()) {
      payload.department = createForm.value.department.trim();
    }

    if (createForm.value.jobTitle.trim()) {
      payload.jobTitle = createForm.value.jobTitle.trim();
    }

    const response = await apiFetch('/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join('、')
          : result.message,
      );
    }

    ElMessage.success('新增成功');

    dialogVisible.value = false;
    resetCreateForm();
    page.value = 1;

    await fetchEmployees();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '新增失敗');
  } finally {
    creating.value = false;
  }
}

function goToDetail(employeeNo: string) {
  router.push(`/employees/${employeeNo}`);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchEmployees();
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;

  fetchEmployees();
}

onMounted(() => {
  fetchEmployees();
});
</script>

<template>
  <main class="page-container employee-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">員工列表</h1>
        <p class="page-description">查詢與管理員工基本資料</p>
      </div>

      <div class="page-actions">
        <el-button @click="logout"> 登出 </el-button>
      </div>
    </div>

    <el-card class="employee-list__search">
      <el-form :model="searchForm" label-position="top">
        <div class="employee-list__search-grid">
          <el-form-item label="姓名">
            <el-input
              v-model="searchForm.name"
              clearable
              placeholder="輸入姓名"
              @keyup.enter="searchEmployees"
            />
          </el-form-item>

          <el-form-item label="Email">
            <el-input
              v-model="searchForm.email"
              clearable
              placeholder="輸入 Email"
              @keyup.enter="searchEmployees"
            />
          </el-form-item>

          <el-form-item label="部門">
            <el-input
              v-model="searchForm.department"
              clearable
              placeholder="輸入部門"
              @keyup.enter="searchEmployees"
            />
          </el-form-item>

          <el-form-item label="職稱">
            <el-input
              v-model="searchForm.jobTitle"
              clearable
              placeholder="輸入職稱"
              @keyup.enter="searchEmployees"
            />
          </el-form-item>

          <el-form-item label="狀態">
            <el-select v-model="searchForm.status" clearable placeholder="全部">
              <el-option label="在職" value="ACTIVE" />

              <el-option label="離職" value="INACTIVE" />
            </el-select>
          </el-form-item>
        </div>

        <div class="employee-list__search-actions">
          <el-button @click="resetSearch"> 清除 </el-button>

          <el-button type="primary" @click="searchEmployees"> 查詢 </el-button>
        </div>
      </el-form>
    </el-card>

    <div class="employee-list__create-action">
      <el-button v-if="isAdmin" type="primary" @click="openCreateDialog">
        新增員工
      </el-button>
    </div>

    <el-card class="employee-list__table-card">
      <el-table v-loading="loading" :data="employees" empty-text="查無員工資料">
        <el-table-column prop="employeeNo" label="員工編號" width="110" />

        <el-table-column prop="name" label="姓名" min-width="120" />

        <el-table-column prop="email" label="Email" min-width="200">
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="department" label="部門" min-width="120">
          <template #default="{ row }">
            {{ row.department || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="jobTitle" label="職稱" min-width="160">
          <template #default="{ row }">
            {{ row.jobTitle || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="hireDate" label="到職日" width="120" />

        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '在職' : '離職' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row.employeeNo)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="employee-list__pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新增員工"
      class="employee-dialog"
      destroy-on-close
    >
      <el-form :model="createForm" label-position="top">
        <el-form-item label="姓名" required>
          <el-input v-model="createForm.name" placeholder="輸入姓名" />
        </el-form-item>

        <el-form-item label="身分證字號" required>
          <el-input
            v-model="createForm.nationalId"
            maxlength="10"
            placeholder="輸入身分證字號"
          />
        </el-form-item>

        <el-form-item label="Email">
          <el-input v-model="createForm.email" placeholder="輸入 Email" />
        </el-form-item>

        <el-form-item label="部門">
          <el-input v-model="createForm.department" placeholder="輸入部門" />
        </el-form-item>

        <el-form-item label="職稱">
          <el-input v-model="createForm.jobTitle" placeholder="輸入職稱" />
        </el-form-item>

        <el-form-item label="狀態">
          <el-select
            v-model="createForm.status"
            class="employee-list__full-width"
          >
            <el-option label="在職" value="ACTIVE" />

            <el-option label="離職" value="INACTIVE" />
          </el-select>
        </el-form-item>

        <el-form-item label="到職日" required>
          <el-date-picker
            v-model="createForm.hireDate"
            style="width: 100%"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="選擇到職日"
            class="employee-list__full-width"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="creating" @click="dialogVisible = false">
          取消
        </el-button>

        <el-button type="primary" :loading="creating" @click="createEmployee">
          新增
        </el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped>
.employee-list {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
}

.page-description {
  margin: 6px 0 0;
  color: #909399;
  font-size: 14px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-list__search {
  margin-bottom: 20px;
}

.employee-list__search-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 16px;
}

.employee-list__search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.employee-list__table-card {
  margin-top: 0px;
}

.employee-list__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.employee-list__full-width {
  width: 100%;
}

.employee-list__create-action {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

:deep(.employee-dialog) {
  width: 520px;
  max-width: calc(100vw - 32px);
}

/* 中等螢幕：一行兩欄 */
@media (max-width: 1024px) {
  .employee-list__search-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 小螢幕：一行一欄 */
@media (max-width: 640px) {
  .employee-list {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
  }

  .employee-list__search-grid {
    grid-template-columns: 1fr;
  }

  .employee-list__search-actions {
    justify-content: stretch;
  }

  .employee-list__search-actions .el-button {
    flex: 1;
  }

  .employee-list__pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

interface EmployeeDetail {
  employeeNo: string;
  name: string;
  nationalId: string;
  email: string | null;
  department: string | null;
  jobTitle: string | null;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:3000';

const route = useRoute();
const router = useRouter();

const role = localStorage.getItem('role');
const isAdmin = role === 'admin';

const editVisible = ref(false);
const updating = ref(false);
const loading = ref(false);
const employee = ref<EmployeeDetail | null>(null);

const editForm = ref({
  name: '',
  nationalId: '',
  email: '',
  department: '',
  jobTitle: '',
  status: 'ACTIVE' as EmployeeStatus,
  hireDate: '',
});

function openEdit() {
  if (!employee.value) return;

  editForm.value = {
    name: employee.value.name,
    nationalId: employee.value.nationalId,
    email: employee.value.email ?? '',
    department: employee.value.department ?? '',
    jobTitle: employee.value.jobTitle ?? '',
    status: employee.value.status,
    hireDate: employee.value.hireDate,
  };

  editVisible.value = true;
}

async function updateEmployee() {
  if (!employee.value) return;

  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    await router.replace('/login');
    return;
  }

  updating.value = true;

  try {
    const response = await fetch(
      `${API_URL}/employees/${employee.value.employeeNo}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: editForm.value.name.trim(),
          nationalId: editForm.value.nationalId.trim().toUpperCase(),
          email: editForm.value.email.trim() || null,
          department: editForm.value.department.trim() || null,
          jobTitle: editForm.value.jobTitle.trim() || null,
          status: editForm.value.status,
          hireDate: editForm.value.hireDate,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join('、')
          : result.message,
      );
    }

    employee.value = result;
    editVisible.value = false;

    ElMessage.success('更新成功');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失敗');
  } finally {
    updating.value = false;
  }
}

async function fetchEmployee() {
  const accessToken = localStorage.getItem('accessToken');
  const employeeNo = route.params.employeeNo as string;

  if (!accessToken) {
    await router.replace('/login');
    return;
  }

  loading.value = true;

  try {
    const response = await fetch(`${API_URL}/employees/${employeeNo}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    employee.value = result;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '讀取失敗');
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/employees');
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

onMounted(fetchEmployee);
</script>

<template>
  <main class="employee-detail">
    <div class="employee-detail__header">
      <h1>員工資料</h1>

      <div>
        <el-button v-if="isAdmin" type="primary" @click="openEdit">
          編輯
        </el-button>

        <el-button @click="goBack"> 返回列表 </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions v-if="employee" :column="2" border>
        <el-descriptions-item label="員工編號">
          {{ employee.employeeNo }}
        </el-descriptions-item>

        <el-descriptions-item label="姓名">
          {{ employee.name }}
        </el-descriptions-item>

        <el-descriptions-item label="身分證字號">
          {{ employee.nationalId }}
        </el-descriptions-item>

        <el-descriptions-item label="Email">
          {{ employee.email || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="部門">
          {{ employee.department || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="職稱">
          {{ employee.jobTitle || '-' }}
        </el-descriptions-item>

        <el-descriptions-item label="到職日">
          {{ employee.hireDate }}
        </el-descriptions-item>

        <el-descriptions-item label="狀態">
          {{ employee.status === 'ACTIVE' ? '在職' : '離職' }}
        </el-descriptions-item>

        <el-descriptions-item label="建立時間">
          {{ formatDateTime(employee.createdAt) }}
        </el-descriptions-item>

        <el-descriptions-item label="更新時間">
          {{ formatDateTime(employee.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </main>
  <el-dialog v-model="editVisible" title="編輯員工" width="520px">
    <el-form :model="editForm" label-position="top">
      <el-form-item label="姓名" required>
        <el-input v-model="editForm.name" />
      </el-form-item>

      <el-form-item label="身分證字號" required>
        <el-input v-model="editForm.nationalId" maxlength="10" />
      </el-form-item>

      <el-form-item label="Email">
        <el-input v-model="editForm.email" />
      </el-form-item>

      <el-form-item label="部門">
        <el-input v-model="editForm.department" />
      </el-form-item>

      <el-form-item label="職稱">
        <el-input v-model="editForm.jobTitle" />
      </el-form-item>

      <el-form-item label="狀態">
        <el-select v-model="editForm.status" style="width: 100%">
          <el-option label="在職" value="ACTIVE" />

          <el-option label="離職" value="INACTIVE" />
        </el-select>
      </el-form-item>

      <el-form-item label="到職日" required>
        <el-date-picker
          v-model="editForm.hireDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="editVisible = false"> 取消 </el-button>

      <el-button type="primary" :loading="updating" @click="updateEmployee">
        儲存
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.employee-detail {
  padding: 24px;
}

.employee-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.employee-detail__header h1 {
  margin: 0;
}

@media (max-width: 640px) {
  .employee-detail {
    padding: 16px;
  }
}
</style>

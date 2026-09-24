<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);

const form = reactive({
  email: 'admin@example.com',
  password: 'Admin123!',
});

async function login() {
  loading.value = true;

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message) ? data.message.join('、') : data.message,
      );
    }

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.user.role);

    ElMessage.success('登入成功');

    await router.push('/employees');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登入失敗');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>人資系統</h2>

      <el-form label-position="top" @submit.prevent>
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="密碼">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          style="width: 100%"
          @click="login"
        >
          登入
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
}

h2 {
  margin-top: 0;
  text-align: center;
}
</style>

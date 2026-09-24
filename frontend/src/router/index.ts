import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/LoginView.vue';
import EmployeeListView from '../views/EmployeeListView.vue';
import EmployeeDetailView from '../views/EmployeeDetailView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/employees',
      component: EmployeeListView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/employees/:employeeNo',
      component: EmployeeDetailView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

export default router;

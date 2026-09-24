import { createRouter, createWebHistory } from 'vue-router';

import EmployeeDetailView from '../views/EmployeeDetailView.vue';
import EmployeeListView from '../views/EmployeeListView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/employees',
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

router.beforeEach((to) => {
  const accessToken = localStorage.getItem('accessToken');

  if (to.meta.requiresAuth && !accessToken) {
    return '/login';
  }

  if (to.path === '/login' && accessToken) {
    return '/employees';
  }
});

export default router;

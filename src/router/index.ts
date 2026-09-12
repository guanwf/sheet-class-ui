import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import DocumentWorkspace from '../views/DocumentWorkspace.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'DocumentWorkspace',
    component: DocumentWorkspace,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

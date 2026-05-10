import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DesignerView from '@/views/DesignerView.vue'
import FillView from '@/views/FillView.vue'
import SubmissionsView from '@/views/SubmissionsView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/designer',
    name: 'designer',
    component: DesignerView,
  },
  {
    path: '/designer/:id',
    name: 'designer-edit',
    component: DesignerView,
  },
  {
    path: '/fill/:formId',
    name: 'fill',
    component: FillView,
  },
  {
    path: '/submissions/:formId',
    name: 'submissions',
    component: SubmissionsView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import MineModel from '../views/MineModel.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MineModel
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

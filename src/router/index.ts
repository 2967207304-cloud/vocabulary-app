import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '今日学习' }
  },
  {
    path: '/words',
    name: 'Words',
    component: () => import('../views/Words.vue'),
    meta: { title: '单词库' }
  },
  {
    path: '/import',
    name: 'Import',
    component: () => import('../views/Import.vue'),
    meta: { title: '批量导入' }
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../views/Review.vue'),
    meta: { title: '学习计划' }
  },
  {
    path: '/day/:day',
    name: 'DayWords',
    component: () => import('../views/DayWords.vue'),
    meta: { title: '单词列表' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { title: '学习统计' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title as string} - 背单词应用`
  next()
})

export default router


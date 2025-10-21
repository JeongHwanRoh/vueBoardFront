import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import BoardListView from '@/views/BoardListView.vue'
import boardDetail from '@/views/boardDetail.vue'

// view 파일로 라우팅
// nuxt를 사용하지 않은 일반 vue3 프로젝트 라우팅 방식
 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' }, // 기본 화면 라우팅(로그인)
    { path: '/login', name: 'login', component: LoginView },  // 로그인 화면
    { path: '/board', name: 'board', component: BoardListView }, // 게시판 메인 화면
    { path: '/board/:id', name: 'boardDetail', component: boardDetail }, // 상세조회
  ],
})

export default router

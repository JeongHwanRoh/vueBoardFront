<template>
  <div class="login-view">
    <h1>로그인 페이지</h1>
    <LoginForm />   <!-- LoginForm 컴포넌트 가져오기 -->
  </div>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue'  // LoginForm 컴포넌트 가져오기
</script>

<style scoped>
.login-view {
  text-align: center;
  margin-top: 100px;
}
</style>

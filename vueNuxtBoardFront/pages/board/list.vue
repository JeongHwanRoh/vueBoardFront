<template>
  <div class="board-view">
    <h1 v-if="user">{{ user.memberId }}님 환영합니다 👋</h1>
    <h1 v-else>로그인이 필요합니다</h1>
    <!-- 게시판 컴포넌트 -->
    <BoardList />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import BoardList from "@/components/BoardList.vue";

const user = ref(null); // ✅ 로그인 사용자 정보 저장

// 로그인 사용자 불러오기
const loadSessionUser = async () => {
  try {
    const res = await axios.get("/api/session", { withCredentials: true });
    if (res.data.isLogin) {
      user.value = res.data.user;
      console.log("✅ 현재 로그인 사용자:", user.value);
    } else {
      console.warn("로그인되지 않은 상태");
    }
  } catch (err) {
    console.error("세션 조회 실패:", err);
  }
};

// 컴포넌트 로드 시 실행
onMounted(() => {
  loadSessionUser();
});

definePageMeta({
  ssr: false
})
</script>

<style scoped>
.board-view {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
}
</style>

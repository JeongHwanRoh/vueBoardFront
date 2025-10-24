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

/*  전체 컨테이너 */
.board-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
  width: 100%;
  min-height: 90vh;
  box-sizing: border-box;
}

/* 사이드바 */
.sidebar {
  width: 250px;
  flex-shrink: 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f8f9fa;
  height: 100%;
  /* position: relative; */
  margin-top: 20px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-title {
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.result-title:hover {
  color: #0056b3;
}

.no-results {
  font-size: 0.9em;
  color: #888;
}

/* 게시판 본문 */
.board-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.board-table {
  width: 100%;
  border-collapse: collapse;
}

.board-table th,
.board-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

/* 링크 */
.link-title {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}

.link-title:hover {
  color: #0056b3;
}

/* 새 게시글 버튼 */
.new-board {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 로그아웃 버튼 */
.logout-btn {
  margin-top: 20px;
  background-color: #555;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #333;
}

/* 삭제 버튼 */
.deleteBoard {
  background-color: red;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.deleteBoard:hover {
  background-color: darkred;
}

/* 게시글 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: #fff;
  width: 400px;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content h3 {
  text-align: center;
  margin-bottom: 12px;
  color: #333;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
}

.modal-content textarea {
  height: 100px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.submit-btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #aaa;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #777;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 페이징 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.pagination button {
  background-color: #eee;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

</style>

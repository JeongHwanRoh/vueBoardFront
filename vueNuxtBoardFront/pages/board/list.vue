<template>
  <div class="board-layout">
    <!-- 상단 헤더 -->
    <BoardHeader :user="user" />

    <!--  좌측 사이드바 + 메인 -->
    <div class="board-body">
      <BoardSidebar
        :boards="boards"
        @select="goToDetail"
        @openModal="showModal = true"
        @openChat="isChatOpen = true"
        @logout="logout"
      />

      <!--  메인 게시판 -->
      <BoardMain
        :boards="boards"
        :user="user"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :showModal="showModal"
        @create="createBoard"
        @delete="deleteBoard"
        @changePage="changePage"
        @closeModal="showModal = false"
        @detail="tryGoToDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { navigateTo } from "#app";

import BoardHeader from "@/components/layout/BoardHeader.vue";
import BoardSidebar from "@/components/layout/BoardSidebar.vue";
import BoardMain from "@/components/layout/BoardMain.vue";

//  상태 변수
const user = ref(null);
const boards = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const totalCount = ref(0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));
const showModal = ref(false);
const isChatOpen = ref(false);

//  게시글 목록 조회
const loadBoards = async () => {
  try {
    const res = await axios.get("/api/board/list", {
      params: { page: currentPage.value, size: pageSize },
    });
    boards.value = res.data.boards;
    totalCount.value = res.data.totalCount;
  } catch (error) {
    console.error("게시글 조회 실패:", error);
  }
};

//  세션 사용자 조회
const loadSessionUser = async () => {
  try {
    const res = await axios.get("/api/session", { withCredentials: true });
    if (res.data.isLogin) {
      user.value = res.data.user;
    } else {
      navigateTo("/login");
    }
  } catch (err) {
    console.error("세션 조회 실패:", err);
  }
};

//  상세 페이지 이동
const tryGoToDetail = (board) => {
  if (!user.value) {
    alert("로그인이 필요합니다.");
    return;
  }
  navigateTo({ path: "/board/detail", query: { id: board.boardId } });
};

const goToDetail = (boardId) => {
  navigateTo({ path: "/board/detail", query: { id: boardId } });
};

//  게시글 등록
const createBoard = async (newBoard) => {
  try {
    await axios.post("/api/board/create", newBoard, { withCredentials: true });
    alert("게시글이 등록되었습니다.");
    showModal.value = false;
    loadBoards();
  } catch (err) {
    console.error("게시글 등록 실패:", err);
  }
};

//  게시글 삭제
const deleteBoard = async (boardId) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await axios.delete(`/api/board/delete/${boardId}`);
    alert("삭제 완료!");
    loadBoards();
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
  }
};

//  페이지 변경
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadBoards();
};

//  로그아웃
const logout = async () => {
  try {
    await axios.post("/api/logout", {}, { withCredentials: true });
    alert("로그아웃 되었습니다.");
    navigateTo("/login");
  } catch (err) {
    console.error("로그아웃 실패:", err);
  }
};

//  초기 실행
onMounted(() => {
  loadSessionUser();
  loadBoards();
});

definePageMeta({ ssr: false });
</script>

<style scoped>
.board-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.board-body {
  display: flex;
  flex: 1;
  background-color: #f5f6fa;
  overflow: hidden;
}
</style>

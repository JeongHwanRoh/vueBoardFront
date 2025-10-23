<template>
  <div class="board-container">
    <!-- 좌측 사이드바 -->
    <aside class="sidebar">
      <h3>🔍 게시글 검색</h3>
      <input v-model="searchKeyword" type="text" placeholder="제목 검색..." class="search-input" />

      <div v-if="filteredBoards.length" class="search-results">
        <ul>
          <li v-for="board in filteredBoards" :key="board.boardId">
            <span class="result-title" @click="goToDetail(board.boardId)">
              {{ board.title }}
            </span>
            <small> - {{ board.writerId }}</small>
          </li>
        </ul>
      </div>
      <p v-else class="no-results">검색 결과가 없습니다.</p>
      <button @click="showModal=true" class="modal_btn">신규 게시물 작성</button>
      <button @click="logout" class="logout-btn">로그아웃</button>
      
      <!-- 새 게시글 작성 모달 -->
      <div class="new-board-modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">   
          <div class="modal-content">
            <h3>✏️ 새 게시글 작성</h3>
            <input v-model="newBoard.title" placeholder="제목" />
            <textarea v-model="newBoard.content" placeholder="내용"></textarea>
            <input v-model="newBoard.writerId" placeholder="작성자" readonly />
            <input v-model="newBoard.category" placeholder="카테고리" />
            <div class="modal-buttons">
              <button class="submit-btn" @click="createBoard">등록</button>
              <button class="cancel-btn" @click="showModal=flase">취소</button>
            </div>
          </div>

        </div>

      </div>
    </aside>

    <!-- 메인 게시판 영역 -->
    <main class="board-list">
      <table class="board-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>등록일</th>
            <th>조회수</th>
            <th>카테고리</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="board in boards" :key="board.boardId">
            <td>{{ board.boardId }}</td>

            <!-- 제목 클릭 시: 로그인 사용자 == 작성자일 때만 이동 -->
            <td>
              <span class="link-title" @click="tryGoToDetail(board)">
                {{ board.title }}
              </span>
            </td>

            <td>{{ board.writerId }}</td>
            <td>{{ formatDate(board.regdate) }}</td>
            <td>{{ board.viewcnt }}</td>
            <td>{{ board.category }}</td>
            <td>
              <button class="deleteBoard" @click="deleteBoard(board.boardId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { navigateTo } from "#app"; //  Nuxt navigateTo 함수 추가
import '@/assets/css/boardList.css'; // boardList.css 

const router = useRouter();

// 반응형 상태
const boards = ref([]);
const user = ref(null); // 로그인 사용자 정보 저장
const searchKeyword = ref(""); //  검색어 상태
const newBoard = ref({
  title: "",
  content: "",
  writerId: "",
  category: "",
});
const showModal=ref(false) // 모달 열고닫기용 상태값

//  제목 검색 필터링
const filteredBoards = computed(() => {
  if (!searchKeyword.value.trim()) return [];
  const keyword = searchKeyword.value.toLowerCase();
  return boards.value.filter((b) =>
    b.title.toLowerCase().includes(keyword)
  );
});

// 게시글 목록 조회
const loadBoards = async () => {
  try {
    const res = await axios.get("/api/board/list");
    boards.value = res.data;
  } catch (error) {
    console.error("게시글 조회 실패:", error);
  }
};

// 세션에서 로그인 사용자(memberId) 자동 로드
const loadSessionUser = async () => {
  try {
    const res = await axios.get("/api/session", { withCredentials: true });
    if (res.data.isLogin) {
      user.value = res.data.user;
      newBoard.value.writerId = user.value.memberId; // 작성자 자동 세팅
      console.log("현재 로그인 사용자:", user.value);
    } else {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  } catch (err) {
    console.error("세션 조회 실패:", err);
  }
};

// 제목 클릭 시 상세페이지 이동(조건부)
const tryGoToDetail = (board) => {
  if (!user.value) {
    alert("로그인이 필요합니다.");
    return;
  }
  navigateTo({
    path: '/board/detail',
    query: { id: board.boardId }
  });
};

//  사이드바 검색결과 클릭 시 바로 이동
const goToDetail = (boardId) => {
  navigateTo({
    path: '/board/detail',
    query: { id: boardId }
  });
};

// 새 게시글 작성
const createBoard = async () => {
  if (!newBoard.value.title || !newBoard.value.writerId) {
    alert("제목과 작성자는 필수 입력 항목입니다.");
    return;
  }
  try {
    await axios.post("/api/board/create", newBoard.value, { withCredentials: true });
    alert("게시글이 등록되었습니다.");
    loadBoards();
  } catch (err) {
    console.error("게시글 등록 실패:", err);
  }
};

// 게시글 삭제
const deleteBoard = async (boardId) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    try {
      await axios.delete(`/api/board/delete/${boardId}`);
      alert("삭제 완료!");
      loadBoards();
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }
  }
};

// 로그아웃
const logout = async () => {
  try {
    await axios.post("/api/logout", {}, { withCredentials: true });
    alert("로그아웃 되었습니다.");
    router.push("/login");
  } catch (err) {
    console.error("로그아웃 실패:", err);
  }
};

// 날짜 포맷 함수
const formatDate = (date) => new Date(date).toLocaleDateString();

// 초기 실행 
onMounted(() => {
  loadBoards(); // 목록 조회  
  loadSessionUser(); // 세션값 불러와 게시글 작성자 자동 세팅
});
</script>

<style scoped></style>

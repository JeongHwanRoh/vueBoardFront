<template>
  <div>
    <h2>📋 게시판 목록</h2>

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
          <td>
            <span class="link-title" @click="goToDetail(board.boardId)">
              {{ board.title }}
            </span>
          </td>
          <td>{{ board.writerId }}</td>
          <td>{{ formatDate(board.regdate) }}</td>
          <td>{{ board.viewcnt }}</td>
          <td>{{ board.category }}</td>
          <td>
            <button @click="deleteBoard(board.boardId)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="new-board">
      <h3>✏️ 새 게시글 작성</h3>
      <input v-model="newBoard.title" placeholder="제목" />
      <textarea v-model="newBoard.content" placeholder="내용"></textarea>
      <input v-model="newBoard.writerId" placeholder="작성자" readonly />
      <input v-model="newBoard.category" placeholder="카테고리" />
      <button @click="createBoard">등록</button>
    </div>
  </div>

  <button @click="logout">로그아웃</button>

</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'; //Composition API에서 라우터 인스턴스를 가져오는 함수

// 초기 상수
const boards = ref([]);
const router = useRouter();
const newBoard = ref({
  title: "",
  content: "",
  writerId: "",  // 로그인한 사용자 id가 자동 세팅될 예정
  category: "",
});

// 게시글 조회
const loadBoards = async () => {
  try {
    const res = await axios.get('/api/board/list');
    boards.value = res.data;
  } catch (error) {
    console.error("게시글 조회 실패:", error);
  }
};

//새 게시글 작성
const createBoard = async () => {
  if (!newBoard.value.title || !newBoard.value.writerId) {
    alert("제목과 작성자는 필수 입력 항목입니다.");
    return;
  }
  try {
    await axios.post('/api/board/create', newBoard.value, { withCredentials: true });
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

// 날짜 포매팅
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

// 세션에서 로그인 사용자(memberId) 자동 로드
const loadSessionUser = async () => {
  const res = await axios.get("/api/session", {
    withCredentials: true,
  });

  if (res.data.isLogin) {
    const user = res.data.user;
    newBoard.value.writerId = user.memberId; // newBoard의 writerId에 세션값 자동 세팅
    console.log("현재 로그인 사용자: ", user);
  } else {
    alert('로그인이 필요합니다');
    window.location.href = "/login";
  }

};

// 제목 클릭 시 라우터 이동
const goToDetail = (boardId) => {
  router.push(`/board/${boardId}`);
}

// 로그아웃
const logout = async () => {
  try {

    const res = await axios.post('/api/logout', {}, { withCredentials: true })
    alert('로그아웃 되었습니다.')
    router.push('/login') //로그인 화면으로 라우팅됨
  } catch (err) {
    console.error('로그아웃 실패:', err)
    alert('로그아웃 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  loadBoards();
  loadSessionUser();
});
</script>

<style scoped>
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

.new-board {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

button {
  cursor: pointer;
}
</style>

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

    <button @click="logout" class="logout-btn">로그아웃</button>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 반응형 상태
const boards = ref([]);
const user = ref(null); // 로그인 사용자 정보 저장
const newBoard = ref({
  title: "",
  content: "",
  writerId: "",
  category: "",
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
  // 내가 작성한 게시물만 상세조회 및 수정 가능하게 설정
  if (board.writerId === user.value.memberId) {
    router.push(`/board/${board.boardId}`);
  } else {
    alert("본인 작성글만 상세 조회/수정할 수 있습니다.");
  }
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

.link-title {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}
.link-title:hover {
  color: #0056b3;
}

.new-board {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

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
</style>

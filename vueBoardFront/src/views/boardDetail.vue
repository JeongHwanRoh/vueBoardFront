<template>
    <div class="board-detail-container" v-if="board">
        <h2>📌 게시글 상세보기</h2>

        <div class="board-info">
            <p><strong>번호:</strong> {{ board.boardId }}</p>
            <p><strong>제목:</strong>
                <!-- title: 수정 모드일 때 input 표시  -->
                <span v-if="!editMode">

                    {{ board.title }}

                </span>
                <input v-else v-model="editBoard.title" class="edit-input" type="text" />

            </p>
            <p><strong>작성자:</strong> {{ board.writerId }}</p>
            <p><strong>등록일:</strong> {{ formatDate(board.regdate) }}</p>
        </div>
        <!-- content: 수정 모드일때 input 표시 -->
        <div class="board-content">
            <h3>내용</h3>
            <div v-if="!editMode">{{ board.content }}</div>
            <textarea v-else v-model="editBoard.content" class="edit-textarea"></textarea>
        </div>

        <div class="buttons">
            <button v-if="!editMode" @click="goBack">목록으로</button>
            <button v-if="!editMode" @click="enableEdit">수정</button>
            <button v-if="!editMode" class="delete" @click="deleteBoard">삭제</button>

            <button v-if="editMode" class="save" @click="updateBoard">✔ 완료</button>
            <button v-if="editMode" @click="cancelEdit">취소</button>
        </div>
    </div>

    <div v-else class="loading">
        <p>게시글을 불러오는 중입니다...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

//  라우터 훅
const route = useRoute()
const router = useRouter()

// 초기 상수
const board = ref(null)
const editBoard=ref({});
const editMode = ref(false)  // editMode 디폴트: false(편집불가)
const boardId = route.params.id // /board/:id 형태일 때 파라미터 추출

//  게시글 상세 조회
const getBoardDetail = async () => {
    try {
        const res = await axios.get(`/api/board/${boardId}`)
        board.value = res.data
        console.log('게시글 상세:', res.data)
    } catch (err) {
        console.error('게시글 불러오기 실패:', err)
        alert('게시글 정보를 불러올 수 없습니다.')
    }
}

// 수정 모드 활성화
const enableEdit = () => {
  editMode.value = true;
  editBoard.value = { ...board.value }; // 기존 데이터 복사
};

// 수정 취소
const cancelEdit = () => {
  editMode.value = false;
  editBoard.value = {};
};

// 수정 완료 (UPDATE)
const updateBoard = async () => {
  try {
    // 등록일 자동 갱신용
    editBoard.value.regdate = new Date().toISOString();

    await axios.put(`/api/board/update/${boardId}`, editBoard.value, {
      withCredentials: true,
    });

    alert("게시글이 수정되었습니다.");
    editMode.value = false;

    // 수정 후 다시 상세 데이터 갱신
    getBoardDetail();
  } catch (err) {
    console.error("게시글 수정 실패:", err);
    alert("수정 중 오류가 발생했습니다.");
  }
};

//  삭제 기능
const deleteBoard = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            await axios.delete(`/api/board/delete/${boardId}`)
            alert('삭제되었습니다.')
            router.push('/board')
        } catch (err) {
            console.error('삭제 실패:', err)
        }
    }
}

//  목록으로 돌아가기
const goBack = () => {
    router.push('/board')
}

//  날짜 포맷
const formatDate = (date) => {
    return new Date(date).toLocaleString()
}


//  초기 데이터 로드
onMounted(() => {
    getBoardDetail()
})
</script>

<style scoped>
.board-detail-container {
    max-width: 700px;
    margin: 30px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 12px;
    background-color: #fff;
}

.board-info p {
    margin: 5px 0;
}

.board-content {
    margin-top: 20px;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    min-height: 100px;
}

.buttons {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

button:hover {
    opacity: 0.8;
}

button.delete {
    background-color: #ff5757;
    color: white;
}
</style>

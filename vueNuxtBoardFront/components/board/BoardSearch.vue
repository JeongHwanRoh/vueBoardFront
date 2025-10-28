<template>
    <h3>🔍 게시글 검색</h3>
    <!-- 검색 입력 -->
    <input v-model="searchKeyword" type="text" placeholder="제목 검색..." class="search-input" />

    <!-- 검색 결과 -->
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
    <button class="modal_btn" @click="showModal = true">신규 게시물 작성</button>
    <button class="chat_btn" @click="isChatOpen = true">채팅하기</button>
    <button class="logout-btn" @click="logout">로그아웃</button>


    <!-- 새 게시글 작성 모달 -->
    <div class="new-board-modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal-content">
                <h3>✏️ 새 게시글 작성</h3>
                <input v-model="newBoard.title" placeholder="제목" />
                <textarea v-model="newBoard.content" placeholder="내용"></textarea>
                <input v-model="newBoard.writerId" placeholder="작성자" readonly />
                <input v-model="newBoard.category" placeholder="카테고리" />
                <div class="modal-buttons">
                    <button class="submit-btn" @click="createBoard">등록</button>
                    <button class="cancel-btn" @click="showModal = flase">취소</button>
                </div>
            </div>

        </div>

    </div>

</template>

<script setup>

import {defineProps, defineEmits} from "vue";
// defineProps(): vue 컴포넌트에서 사용하는 프로퍼티들을 명시적으로 정의
// 부모 컴포넌트 -> 자식 컴포넌트 데이터 전달
// props: 상위 컴포넌트(list.vue)로부터 게시글 목록 전달받음
const props = defineProps({
    boards: {
        type: Array,
        default: () => [],
    },
});

// defineEmits(): 자식 컴포넌트에-> 부모 컴포넌트 데이터 전달
// emits: 검색결과 클릭 시 부모(list.vue)에게 boardId 전달
const emit = defineEmits(["select"]);

const searchKeyword = ref(""); //  검색어 상태

//  제목 검색 필터링
const filteredBoards = computed(() => {
    if (!searchKeyword.value.trim()) return [];
    const keyword = searchKeyword.value.toLowerCase();
    return boards.value.filter((b) =>
        b.title.toLowerCase().includes(keyword)
    );
});



</script>

<style scoped>
.board-search {
    width: 250px;
    flex-shrink: 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #f8f9fa;
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

.result-item {
    cursor: pointer;
    margin-bottom: 4px;
}

.result-title {
    color: #007bff;
    text-decoration: underline;
}

.result-title:hover {
    color: #0056b3;
}

.no-results {
    font-size: 0.9em;
    color: #888;
}
</style>
<template>
  <aside class="sidebar">
    <h3>🔍 게시글 검색</h3>

    <!-- 검색창 (BoardSearch 컴포넌트로 분리해도 OK) -->
    <input
      v-model="searchKeyword"
      type="text"
      placeholder="제목 검색..."
      class="search-input"
    />

    <div v-if="filteredBoards.length" class="search-results">
      <ul>
        <li v-for="board in filteredBoards" :key="board.boardId">
          <span class="result-title" @click="$emit('select', board.boardId)">
            {{ board.title }}
          </span>
          <small> - {{ board.writerId }}</small>
        </li>
      </ul>
    </div>
    <p v-else class="no-results">검색 결과가 없습니다.</p>

    <button class="modal_btn" @click="$emit('openModal')">신규 게시물 작성</button>
    <button class="chat_btn" @click="$emit('openChat')">채팅하기</button>
    <button class="logout-btn" @click="$emit('logout')">로그아웃</button>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  boards: { type: Array, default: () => [] },
});

const emit = defineEmits(["select", "openModal", "openChat", "logout"]);

const searchKeyword = ref("");

const filteredBoards = computed(() => {
  if (!searchKeyword.value.trim()) return [];
  const lower = searchKeyword.value.toLowerCase();
  return props.boards.filter((b) => b.title.toLowerCase().includes(lower));
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  flex-shrink: 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f8f9fa;
  height: 100%;
  margin-top: 20px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
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

button {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal_btn {
  background-color: #007bff;
  color: white;
}

.chat_btn {
  background-color: #28a745;
  color: white;
}

.logout-btn {
  background-color: #555;
  color: white;
}

.logout-btn:hover {
  background-color: #333;
}
</style>

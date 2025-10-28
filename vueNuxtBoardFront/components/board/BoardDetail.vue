<template>
  <div class="board-detail" v-if="board">
    <h2>{{ board.title }}</h2>
    <p class="meta">
      작성자: {{ board.writerId }} | 등록일: {{ formatDate(board.regdate) }} | 조회수: {{ board.viewcnt }}
    </p>
    <div class="content">
      {{ board.content }}
    </div>

    <button class="back-btn" @click="$emit('back')">← 목록으로</button>
  </div>

  <div v-else class="no-data">
    <p>게시글 정보를 불러올 수 없습니다.</p>
  </div>
</template>

<script setup>
import {defineProps, defineEmits} from 'vue';
const props = defineProps({
  board: {
    type: Object,
    default: null,
  },
});

defineEmits(["back"]);

const formatDate = (date) => new Date(date).toLocaleDateString();
</script>

<style scoped>
.board-detail {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.meta {
  color: #777;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.content {
  min-height: 150px;
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.back-btn {
  background-color: #555;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #333;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>

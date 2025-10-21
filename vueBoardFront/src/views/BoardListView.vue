<template>
  <div class="board-view">
    <h1>게시판 메인</h1>
    <BoardList />
  </div>
</template>

<script setup>
import BoardList from "@/components/BoardList.vue";
</script>

<style scoped>
.board-view {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
}
</style>

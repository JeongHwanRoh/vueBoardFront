<template>
    <main class="board-main">
        <div class="board-header">
            <h2>📋 게시판 목록</h2>
        </div>

        <!-- BoardMain이 detail 이벤트를 상위페이지(list.vue)로 다시 emit -->
        <BoardTable :boards="boards"
        @detail="$emit('detail', $event)" 
        @delete="$emit('delete', $event)"
        />
        <Pagination :currentPage="currentPage" :totalPages="totalPages" @change="$emit('changePage', $event)" />


    </main>
</template>

<script setup>
import BoardTable from "@/components/board/BoardTable.vue"; // 테이블 조회
import Pagination from "@/components/board/Pagination.vue"; // 페이징(10개씩)


defineProps({
    boards: Array,
    user: Object,
    currentPage: Number,
    totalPages: Number,
    showModal: Boolean,
});

defineEmits(["create", "delete", "changePage", "closeModal", "detail"]);
</script>

<style scoped>
.board-main {
    flex: 1;
    padding: 24px 40px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.new-board-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
}

.new-board-btn:hover {
    background-color: #0056b3;
}
</style>

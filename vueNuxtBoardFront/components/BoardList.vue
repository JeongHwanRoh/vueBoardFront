<template>
    <div class="board-container"> <!-- 좌측 사이드바 -->
        <aside class="sidebar">
            <h3>🔍 게시글 검색</h3> <input v-model="searchKeyword" type="text" placeholder="제목 검색..." class="search-input" />
            <div v-if="filteredBoards.length" class="search-results">
                <ul>
                    <li v-for="board in filteredBoards" :key="board.boardId"> <span class="result-title"
                            @click="goToDetail(board.boardId)"> {{ board.title }} </span> <small> - {{ board.writerId
                            }}</small> </li>
                </ul>
            </div>
            <p v-else class="no-results">검색 결과가 없습니다.</p> <button class="modal_btn" @click="showModal = true">신규 게시물
                작성</button> <button class="chat_btn" @click="isChatOpen = true">채팅하기</button> <button class="logout-btn"
                @click="logout">로그아웃</button>
            <!-- 새 게시글 작성 모달 -->
            <div class="new-board-modal">
                <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
                    <div class="modal-content">
                        <h3>✏️ 새 게시글 작성</h3> <input v-model="newBoard.title" placeholder="제목" /> <textarea
                            v-model="newBoard.content" placeholder="내용"></textarea> <input v-model="newBoard.writerId"
                            placeholder="작성자" readonly /> <input v-model="newBoard.category" placeholder="카테고리" />
                        <div class="modal-buttons"> <button class="submit-btn" @click="createBoard">등록</button> <button
                                class="cancel-btn" @click="showModal = flase">취소</button> </div>
                    </div>
                </div>
            </div>
        </aside> <!-- 메인 게시판 영역 -->
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
                    <tr v-for="board in boards" :key="board.boardId"> <!-- 아래 부분 v-for 컴포넌트 분리 => 컴포넌트를 반복시키는게 좋음 -->
                        <td>{{ board.boardId }}</td> <!-- 제목 클릭 시: 로그인 사용자 == 작성자일 때만 이동 -->
                        <td> <span class="link-title" @click="tryGoToDetail(board)"> {{ board.title }} </span> </td>
                        <td>{{ board.writerId }}</td>
                        <td>{{ formatDate(board.regdate) }}</td>
                        <td>{{ board.viewcnt }}</td>
                        <td>{{ board.category }}</td>
                        <td> <button class="deleteBoard" @click="deleteBoard(board.boardId)">삭제</button> </td>
                    </tr>
                </tbody>
            </table> <!-- 페이징 -->
            <div class="pagination"> <button @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1">이전</button> <button v-for="page in totalPages" :key="page"
                    @click="changePage(page)" :class="{ active: page === currentPage }"> {{ page }} </button> <button
                    @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button> </div>
        </main> <!-- 분리된 채팅 모달 --> <!--ChatModal을 렌더링은 그대로 유지하면서,실제 DOM 위치는 <body>로 옮겨서 띄움 -->
        <ChatModal :isOpen="isChatOpen" @close="isChatOpen = false" />
    </div>
</template>
<script
    setup>    import ChatModal from "@/components/ChatModal.vue"; //채팅 컴포넌트 불러오기 // import '@/assets/css/boardList.css'; // boardList.css import axios from "axios"; import { ref, onMounted, computed } from "vue"; import { useRouter } from "vue-router"; import { navigateTo } from "#app"; // Nuxt navigateTo 함수 추가 const router = useRouter(); // 반응형 상태 변수 const boards = ref([]); const user = ref(null); // 로그인 사용자 정보 저장 const searchKeyword = ref(""); // 검색어 상태 const newBoard = ref({ title: "", content: "", writerId: "", category: "", }); const showModal = ref(false) // 모달 열고닫기용 상태값 // 페이징 관련 상태 변수 const currentPage = ref(1); // 현재페이지(디폴트:1) const pageSize = 10; // 페이징 사이즈: 10 const totalCount = ref(0); // toalCount(디폴트:0) const totalPages = computed(() => Math.ceil(totalCount.value / pageSize)); // 페이지수: (전체페이지/10)를 올림처리한 값 // 채팅 관련 상태 변수 const userId = ref(""); const isChatOpen = ref(false); // 채팅오픈상태(디폴트: 닫힘) // 제목 검색 필터링 const filteredBoards = computed(() => { if (!searchKeyword.value.trim()) return []; const keyword = searchKeyword.value.toLowerCase(); return boards.value.filter((b) => b.title.toLowerCase().includes(keyword) ); }); // 게시글 목록 조회 // load보다는 get(가져오기 등등), post로 명명 const loadBoards = async () => { try { const res = await axios.get(/api/board/list, { params: { page: currentPage.value, size: pageSize }, }); boards.value = res.data.boards; totalCount.value = res.data.totalCount; } catch (error) { console.error("게시글 조회 실패:", error); } }; // 세션에서 로그인 사용자(memberId) 자동 로드 const loadSessionUser = async () => { try { const res = await axios.get("/api/session", { withCredentials: true }); if (res.data.isLogin) { user.value = res.data.user; userId.value = user.value.memberId; // 세션에서 로그인 ID 저장 newBoard.value.writerId = user.value.memberId; // 작성자 자동 세팅 console.log("현재 로그인 사용자:", userId.value); } else { alert("로그인이 필요합니다."); router.push("/login"); } } catch (err) { console.error("세션 조회 실패:", err); } }; // 제목 클릭 시 상세페이지 이동(조건부) const tryGoToDetail = (board) => { if (!user.value) { alert("로그인이 필요합니다."); return; } navigateTo({ path: '/board/detail', query: { id: board.boardId } }); }; // 사이드바 검색결과 클릭 시 바로 이동 const goToDetail = (boardId) => { navigateTo({ path: '/board/detail', query: { id: boardId } }); }; // 새 게시글 작성 const createBoard = async () => { if (!newBoard.value.title || !newBoard.value.writerId) { alert("제목과 작성자는 필수 입력 항목입니다."); return; } try { await axios.post("/api/board/create", newBoard.value, { withCredentials: true }); alert("게시글이 등록되었습니다."); loadBoards(); } catch (err) { console.error("게시글 등록 실패:", err); } }; // 게시글 삭제 const deleteBoard = async (boardId) => { if (confirm("정말 삭제하시겠습니까?")) { try { await axios.delete(/api/board/delete/${boardId}); alert("삭제 완료!"); loadBoards(); } catch (error) { console.error("게시글 삭제 실패:", error); } } }; // 로그아웃 const logout = async () => { try { await axios.post("/api/logout", {}, { withCredentials: true }); alert("로그아웃 되었습니다."); router.push("/login"); } catch (err) { console.error("로그아웃 실패:", err); } }; // 날짜 포맷 함수 const formatDate = (date) => new Date(date).toLocaleDateString(); // 페이지 이동함수 const changePage = (page) => { if (page < 1 || page > totalCount.value) { return; } currentPage.value = page; loadBoards(); } // 초기 실행 onMounted(() => { loadBoards(); // 목록 조회 loadSessionUser(); // 세션값 불러와 게시글 작성자 자동 세팅 }); </script>
<style>
/* ================================ 🔹 BoardList 컴포넌트 CSS ================================ */
/* 전체 컨테이너 */
.board-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 24px;
    width: 100%;
    min-height: 90vh;
    box-sizing: border-box;
}

/* 사이드바 */
.sidebar {
    width: 250px;
    flex-shrink: 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #f8f9fa;
    height: 100%;
    /* position: relative; */
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

/* 게시판 본문 */
.board-list {
    flex: 1;
    display: flex;
    flex-direction: column;
}

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

/* 링크 */
.link-title {
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
}

.link-title:hover {
    color: #0056b3;
}

/* 새 게시글 버튼 */
.new-board {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* 로그아웃 버튼 */
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

/* 삭제 버튼 */
.deleteBoard {
    background-color: red;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.deleteBoard:hover {
    background-color: darkred;
}

/* 게시글 모달 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content {
    background-color: #fff;
    width: 400px;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeIn 0.3s ease-in-out;
}

.modal-content h3 {
    text-align: center;
    margin-bottom: 12px;
    color: #333;
}

.modal-content input,
.modal-content textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
    resize: none;
}

.modal-content textarea {
    height: 100px;
}

.modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
}

.submit-btn {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.submit-btn:hover {
    background-color: #0056b3;
}

.cancel-btn {
    background-color: #aaa;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.cancel-btn:hover {
    background-color: #777;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 페이징 */
.pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 20px;
}

.pagination button {
    background-color: #eee;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
}

.pagination button.active {
    background-color: #007bff;
    color: white;
}

.pagination button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>

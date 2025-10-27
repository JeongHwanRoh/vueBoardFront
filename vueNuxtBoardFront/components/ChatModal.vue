<template>
  <div v-if="isOpen" class="chat-modal">
    <div class="chat-content">
      <!-- 상단 헤더 -->
      <div class="chat-header">
        <h3>💬 실시간 채팅</h3>
        <span class="close" @click="$emit('close')">&times;</span>
      </div>

      <!-- 채팅 메시지 영역 -->
      <div class="chat-messages" ref="chatMessages">
        <div v-for="(msg, idx) in messages" :key="idx" class="chat-msg">
          <strong>{{ msg.name }}:</strong>
          <span>{{ msg.message }}</span>
          <small>{{ formatTime(msg.time) }}</small>
        </div>
      </div>

      <!-- 하단 입력 영역 -->
      <div class="chat-input-area">
        <div>
          <input v-model="newMessage" type="text" placeholder="메시지를 입력하세요..." @keyup.enter="sendMessage" />
        </div>
        <button @click="sendMessage">전송</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import axios from "axios";
/* SockJS + Stomp */
import SockJS from "sockjs-client";
import stomp from "stompjs";


const props = defineProps({
  isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(["close"]);

const newMessage = ref("");
const messages = ref([]);
const user = ref(null);
const userId = ref("익명");
const stompClient = ref(null)

// ✅ 세션 불러오기
const loadSessionUser = async () => {
  try {
    const res = await axios.get("/api/session", { withCredentials: true });
    if (res.data.isLogin) {
      user.value = res.data.user;
      userId.value = user.value.memberId;
    }
  } catch (err) {
    console.error("세션 조회 실패:", err);
  }
};

// ✅ 메시지 전송
const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  const chat = {
    name: userId.value,
    message: newMessage.value,

  }
  stompClient.value.send("/app/send", {}, JSON.stringify(chat))

  newMessage.value = "";
};


// ✅ 메시지가 추가될 때마다 자동 스크롤
watch(messages, async () => {
  await nextTick();
  const box = document.querySelector(".chat-messages");
  if (box) box.scrollTop = box.scrollHeight;
});

// ✅ 모달 열릴 때 세션 불러오기
watch(
  () => props.isOpen,
  (val) => {
    if (val) loadSessionUser();
  }
);

// ✅ 시간 포맷
const formatTime = (time) =>
  new Date(time).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// 웹소켓(stomp) 연결 로직

// 마운트 시 WebSocket 연결
onMounted(() => {
  const socket = new SockJS("/ws-chat");
  stompClient.value = Stomp.over(socket);

  // connect가 완료된 이후에 subscribe 실행
  stompClient.value.connect({}, () => {
    console.log("STOMP 연결 성공");

    stompClient.value.subscribe("/topic/messages", (msg) => {
      const message = JSON.parse(msg.body);
      messages.value.push(message);
    });
  });
});

// 연결 해제
onBeforeUnmount(() => {
  if (stompClient.value) {
    stompClient.value.disconnect()
    console.log("STOMP 연결 종료")
  }
})


</script>

<style>
/* ==========================================
   🔹 ChatModal 컴포넌트용 CSS
   ========================================== */
.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  /* ✅ 살짝 투명 조정 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
}

.chat-content {
  width: 400px;
  height: 550px;
  /* ✅ 안정된 고정 높이 */
  max-height: 90vh;
  background: white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.chat-header {
  background-color: #007bff;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.chat-messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px 12px 6px 12px;
  /* ✅ 입력창과 시각적 일체감 */
  scroll-behavior: smooth;
}

.chat-msg {
  margin-bottom: 8px;
  line-height: 1.4;
}

.chat-msg strong {
  color: #007bff;
}

.chat-msg small {
  color: gray;
  font-size: 11px;
  margin-left: 5px;
}

.chat-input-area {
  display: flex;
  flex-direction: column;
  /* ✅ 세로 정렬 */
  gap: 8px;
  /* ✅ 입력창과 버튼 사이 여백 */
  border-top: 1px solid #ccc;
  background: white;
  padding: 10px;
  flex-shrink: 0;
}

.chat-input-area input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
}

.chat-input-area input:focus {
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.4);
}

.chat-input-area button {
  background: #007bff;
  color: white;
  border: none;
  height: 36px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.chat-input-area button:hover {
  background: #0056b3;
}
</style>

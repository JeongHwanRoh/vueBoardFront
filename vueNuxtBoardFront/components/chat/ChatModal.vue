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
          <small>{{ new Date(msg.sendtime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }}</small>
        </div>
      </div>

      <!-- 하단 입력 영역 -->

      <div class="chat-input-area">
        <input v-model="newMessage" type="text" placeholder="메시지를 입력하세요..." @keyup.enter="sendMessage" />
      </div>
      <button @click="sendMessage">전송</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount, defineProps, defineEmits } from "vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  user: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const newMessage = ref("");
const messages = ref([]);
const stompClient = ref(null);

// 메시지 전송
const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const chat = {
    memberId: props.user?.memberId || "guest",
    name: props.user?.name || "익명",
    message: newMessage.value,
    sendtime: new Date().toISOString(),
  };

  stompClient.value.send("/app/send", {}, JSON.stringify(chat));
  newMessage.value = "";
};

// 메시지 스크롤
watch(messages, async () => {
  await nextTick();
  const box = document.querySelector(".chat-messages");
  if (box) box.scrollTop = box.scrollHeight;
});

// 모달 열릴 때 연결
watch(
  () => props.isOpen,
  (val) => {
    if (val) connectWebSocket();
  }
);


// STOMP 연결
const connectWebSocket = () => {

  if (stompClient.value && stompClient.value.connected) {
    console.log("이미 STOMP 연결 중 - 재연결 생략");
    return;
  }
  const socket = new SockJS("/ws-chat");
  stompClient.value = Stomp.over(socket);

  stompClient.value.connect({}, () => {
    console.log("✅ STOMP 연결 성공");
    stompClient.value.subscribe("/topic/messages", (msg) => {
      const message = JSON.parse(msg.body);
      messages.value.push(message);
    });
  });
};

// 연결 해제
onBeforeUnmount(() => {
  if (stompClient.value) {
    stompClient.value.disconnect();
    console.log("🧹 STOMP 연결 종료");
  }
});
</script>

<style scoped>
.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.chat-content {
  width: 400px;
  height: 550px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background-color: #007bff;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
}

.chat-msg {
  margin-bottom: 8px;
}

.chat-input-area {
  display: flex;
  border-top: 1px solid #ccc;
  padding: 10px;
}

.chat-input-area input {
  flex: 1;
  padding: 8px;
  margin-right: 8px;
}

.chat-input-area button {
  padding: 8px 16px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

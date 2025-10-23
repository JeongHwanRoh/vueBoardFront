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

const props = defineProps({
  isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(["close"]);

const newMessage = ref("");
const messages = ref([]);
const user = ref(null);
const userId = ref("익명");

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

  messages.value.push({
    name: userId.value || "익명",
    message: newMessage.value,
    time: new Date(),
  });

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
</script>

<style>

</style>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount, defineProps, defineEmits } from "vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  user: { type: Object, default: null }, //  상위에서 전달받기
});
const emit = defineEmits(["close"]);

const newMessage = ref("");
const messages = ref([]);
const stompClient = ref(null);

//  메시지 전송 함수
const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const chat = {
    memberId: props.user?.memberId || "guest",
    name: props.user?.name || "익명",
    message: newMessage.value,
    sendtime: new Date().toISOString(), // 로컬 즉시 표시용
  };

  // WebSocket 전송
  stompClient.value.send("/app/send", {}, JSON.stringify(chat));
  newMessage.value = "";
};

//  메시지 자동 스크롤
watch(messages, async () => {
  await nextTick();
  const box = document.querySelector(".chat-messages");
  if (box) box.scrollTop = box.scrollHeight;
});

//  모달이 열릴 때마다 연결
watch(
  () => props.isOpen,
  (val) => {
    if (val) connectWebSocket();
  }
);

//  STOMP 연결
const connectWebSocket = () => {
  const socket = new SockJS("/ws-chat");
  stompClient.value = Stomp.over(socket);

  stompClient.value.connect({}, () => {
    console.log(" STOMP 연결 성공");
    stompClient.value.subscribe("/topic/messages", (msg) => {
      const message = JSON.parse(msg.body);
      messages.value.push(message);
    });
  });
};

//  연결 해제
onBeforeUnmount(() => {
  if (stompClient.value) {
    stompClient.value.disconnect();
    console.log("🧹 STOMP 연결 종료");
  }
});
</script>

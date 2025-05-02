import { ref } from 'vue';
import { global } from './global';
import { UserManager } from './user';
import { addMessage, getTotalUnreadCount } from './message';

// 创建可响应式的状态
export const newMessageCount = ref(0);
export const isConnected = ref(false);
export const socket = ref<WebSocket | null>(null);

// 重连相关配置
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000;
let heartbeatTimer: number | null = null;

// 初始化WebSocket连接
export function initWebSocket() {
  if (!UserManager.isLogin() || socket.value?.readyState === WebSocket.OPEN) return;

  const wsUrl = `${global.ws_path}?token=${global.token}`;
  socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => {
    console.log('WebSocket 连接已建立');
    isConnected.value = true;
    reconnectAttempts = 0;
    startHeartbeat();
  };

  socket.value.onmessage = (event) => {
    handleMessage(event.data);
  };

  socket.value.onclose = (event) => {
    console.log('WebSocket 连接关闭', event);
    isConnected.value = false;
    handleReconnect();
  };

  socket.value.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    isConnected.value = false;
    socket.value?.close();
  };
}

// 处理接收消息
function handleMessage(data: string) {
  try {
    const message = JSON.parse(data);
    if (message.type === 'heartbeat') return;

    console.log('收到消息:', message);
    
    // 处理接收到的消息
    if (message.sender_id && message.content) {
      // 确保消息有接收者ID
      if (!message.receiver_id) {
        message.receiver_id = UserManager.getUserId;
      }
      
      // 标记消息不是自己发送的
      message.is_self = false;
      
      // 添加到消息存储
      addMessage(message);
      
      // 更新未读消息计数
      newMessageCount.value = getTotalUnreadCount();
    }
    
    // 触发全局消息事件
    window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));
  } catch (e) {
    console.error('消息解析失败:', e);
  }
}

// 心跳机制
function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  
  heartbeatTimer = setInterval(() => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }, 30000) as unknown as number;
}

// 重连处理
function handleReconnect() {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    setTimeout(() => {
      console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`);
      initWebSocket();
    }, reconnectInterval);
  }
}

// 发送消息
export function sendWebSocketMessage(message: any) {
  if (socket.value?.readyState === WebSocket.OPEN) {
    // 添加发送者ID
    message.sender_id = UserManager.getUserId;
    
    // 发送消息
    socket.value.send(JSON.stringify(message));
    
    // 添加到本地消息存储
    addMessage({
      ...message,
      is_self: true
    });
    
    return true;
  }
  return false;
}

// 清理连接
export function cleanupWebSocket() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (socket.value) {
    socket.value.close();
    socket.value = null;
  }
}

// 重置未读消息计数
export function resetMessageCount() {
  newMessageCount.value = 0;
}

// 添加到全局对象，方便访问
global.socket = socket.value as WebSocket;
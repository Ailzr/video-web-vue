<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { UserManager, getAvatarPath } from '../api/user';
import follow_manager from '../api/follow';
import { sendWebSocketMessage } from '../api/websocket';
import { 
  getContacts, 
  getMessages, 
  setCurrentContact, 
  updateContactsFromFollowList,
  addOrUpdateContact,
  Contact
} from '../api/message';
import { useMessage } from 'naive-ui';

// 状态
const newMessage = ref('');
const selectedContact = ref<Contact | null>(null);
const contacts = ref<Contact[]>([]);
const messages = ref<any[]>([]);
const loading = ref(true);
const followLoading = ref(true);
const searchQuery = ref('');
const message = useMessage();
const user_manager = new UserManager();

// 获取关注列表
async function getFollowList() {
  try {
    followLoading.value = true;
    const res = await follow_manager.getFollowList(1);
    // 更新联系人列表，标记关注状态
    updateContactsFromFollowList(res);
    // 更新本地联系人列表
    contacts.value = getContacts();
    
    // 获取非关注联系人的信息
    await fetchNonFollowedContactsInfo();
  } catch (error) {
    console.error('获取关注列表失败:', error);
    message.error('获取关注列表失败');
  } finally {
    followLoading.value = false;
    loading.value = false;
  }
}

// 获取非关注联系人的信息
async function fetchNonFollowedContactsInfo() {
  const nonFollowedContacts = contacts.value.filter(contact => !contact.isFollowed);
  
  for (const contact of nonFollowedContacts) {
    try {
      const userInfo = await user_manager.getUserInfoByUuid(contact.uuid);
      if (userInfo) {
        // 更新联系人信息
        addOrUpdateContact(contact.uuid, {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar,
          bio: userInfo.description
        });
      }
    } catch (error) {
      console.error(`获取用户 ${contact.uuid} 信息失败:`, error);
    }
  }
  
  // 刷新联系人列表
  contacts.value = getContacts();
}

// 选择聊天对象
async function selectContact(contact: Contact) {
  selectedContact.value = contact;
  setCurrentContact(contact.uuid);
  
  // 如果是未知用户，尝试获取用户信息
  if (!contact.nickname || contact.nickname === '未知用户') {
    try {
      const userInfo = await user_manager.getUserInfoByUuid(contact.uuid);
      if (userInfo) {
        // 更新联系人信息
        addOrUpdateContact(contact.uuid, {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar,
          bio: userInfo.description
        });
        
        // 刷新联系人列表和选中的联系人
        contacts.value = getContacts();
        selectedContact.value = contacts.value.find(c => c.uuid === contact.uuid) || contact;
      }
    } catch (error) {
      console.error(`获取用户 ${contact.uuid} 信息失败:`, error);
    }
  }
  
  // 加载与该联系人的消息
  messages.value = getMessages(contact.uuid);
  // 自动滚动到底部
  setTimeout(scrollToBottom, 50);
}

// 发送消息
function sendMessage() {
  if (!newMessage.value.trim() || !selectedContact.value) return;

  const messageObj = {
    receiver_id: selectedContact.value.uuid,
    content: newMessage.value.trim(),
    send_time: new Date().toISOString()
  };

  // 通过WebSocket发送
  if (sendWebSocketMessage(messageObj)) {
    // 发送成功，清空输入框
    newMessage.value = '';
    // 更新本地消息列表
    messages.value = getMessages(selectedContact.value.uuid);
    // 自动滚动到底部
    setTimeout(scrollToBottom, 50);
  } else {
    message.error('发送失败，请检查网络连接');
  }
}

// 监听全局消息
async function handleIncomingMessage(event: Event) {
  const messageData = (event as CustomEvent).detail;
  
  // 如果收到来自未知用户的消息，尝试获取用户信息
  if (messageData.sender_id && !messageData.is_self) {
    const existingContact = contacts.value.find(c => c.uuid === messageData.sender_id);
    if (!existingContact || !existingContact.nickname || existingContact.nickname === '未知用户') {
      try {
        const userInfo = await user_manager.getUserInfoByUuid(messageData.sender_id);
        if (userInfo) {
          // 更新联系人信息
          addOrUpdateContact(messageData.sender_id, {
            nickname: userInfo.nickname,
            avatar: userInfo.avatar,
            bio: userInfo.description
          });
          
          // 刷新联系人列表
          contacts.value = getContacts();
        }
      } catch (error) {
        console.error(`获取用户 ${messageData.sender_id} 信息失败:`, error);
      }
    }
  }
  
  // 如果当前有选中的联系人，并且消息与当前联系人相关
  if (selectedContact.value) {
    // 更新消息列表
    messages.value = getMessages(selectedContact.value.uuid);
    // 自动滚动到底部
    setTimeout(scrollToBottom, 50);
  }
  
  // 更新联系人列表
  contacts.value = getContacts();
}

// 滚动到底部
function scrollToBottom() {
  const chatContainer = document.querySelector('.message-list');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// 格式化时间
function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 格式化日期
function formatDate(timeString: string): string {
  const date = new Date(timeString);
  return date.toLocaleDateString();
}

// 获取默认头像
function getDefaultAvatar() {
  return '/path/to/default-avatar.png';
}

// 过滤联系人列表
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value;
  
  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter(contact => 
    (contact.nickname || '').toLowerCase().includes(query)
  );
});

// 组件生命周期
onMounted(() => {
  window.addEventListener('websocket-message', handleIncomingMessage);
  // 加载联系人列表
  contacts.value = getContacts();
  // 获取关注列表
  getFollowList();
  loading.value = false;
});

onUnmounted(() => {
  window.removeEventListener('websocket-message', handleIncomingMessage);
  // 清除当前联系人
  setCurrentContact(null);
});

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom();
}, { deep: true });
</script>

<template>
  <div class="message-page">
    <!-- 联系人列表 -->
    <div class="contacts-panel">
      <div class="contacts-header">
        <h2>我的消息</h2>
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索联系人..." 
            class="search-input"
          />
        </div>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载联系人中...</p>
      </div>
      
      <div v-else-if="contacts.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>暂无消息记录</p>
        <p v-if="followLoading">正在加载关注列表...</p>
      </div>
      
      <div v-else class="contacts-list">
        <div 
          v-for="contact in filteredContacts" 
          :key="contact.uuid"
          class="contact-item"
          :class="{ 
            'selected': selectedContact?.uuid === contact.uuid,
            'unread': contact.unreadCount > 0
          }"
          @click="selectContact(contact)"
        >
          <div class="contact-avatar">
            <img :src="contact.avatar ? getAvatarPath(contact.avatar) : getDefaultAvatar()" alt="用户头像">
            <span v-if="contact.unreadCount > 0" class="unread-badge">{{ contact.unreadCount }}</span>
          </div>
          <div class="contact-info">
            <div class="contact-name">
              {{ contact.nickname || '未知用户' }}
              <span v-if="contact.isFollowed" class="follow-badge">已关注</span>
            </div>
            <div class="contact-last-message" v-if="contact.lastMessage">{{ contact.lastMessage }}</div>
            <div class="contact-status" v-else>{{ contact.bio || '这个人很懒，什么都没留下~' }}</div>
            <div class="contact-time" v-if="contact.lastTime">{{ formatTime(contact.lastTime) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 聊天窗口 -->
    <div class="chat-panel">
      <div v-if="!selectedContact" class="no-chat-selected">
        <div class="empty-chat-icon">💬</div>
        <h3>选择一个联系人开始聊天</h3>
        <p>从左侧列表选择您想聊天的人</p>
      </div>
      
      <template v-else>
        <div class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">
              <img 
                :src="selectedContact.avatar ? getAvatarPath(selectedContact.avatar) : getDefaultAvatar()" 
                alt="用户头像"
              >
            </div>
            <div class="chat-name">
              {{ selectedContact.nickname || '未知用户' }}
              <span v-if="selectedContact.isFollowed" class="follow-badge">已关注</span>
            </div>
          </div>
        </div>
        
        <div class="message-list">
          <div v-if="messages.length === 0" class="empty-chat">
            <p>开始和 {{ selectedContact.nickname || '未知用户' }} 的对话吧</p>
          </div>
          
          <template v-else>
            <div 
              v-for="(msg, index) in messages" 
              :key="index"
              class="message-group"
            >
              <!-- 日期分隔线 -->
              <div 
                v-if="index === 0 || formatDate(msg.send_time) !== formatDate(messages[index-1].send_time)" 
                class="date-divider"
              >
                <span>{{ formatDate(msg.send_time) }}</span>
              </div>
              
              <div 
                :class="['message-item', { 'self-message': msg.is_self }]"
              >
                <!-- 对方头像 - 只在非自己发送的消息显示在左侧 -->
                <div class="message-avatar" v-if="!msg.is_self">
                  <img 
                    :src="selectedContact.avatar ? getAvatarPath(selectedContact.avatar) : getDefaultAvatar()" 
                    alt="用户头像"
                  >
                </div>
                
                <div class="message-content">
                  <div class="message-text">{{ msg.content }}</div>
                  <div class="message-time">{{ formatTime(msg.send_time) }}</div>
                </div>
                
                <!-- 自己的头像 - 只在自己发送的消息显示在右侧 -->
                <div class="message-avatar" v-if="msg.is_self">
                  <img :src="UserManager.avatarPath" alt="我的头像">
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="message-input">
          <textarea 
            v-model="newMessage" 
            @keyup.enter.exact="sendMessage" 
            placeholder="输入消息..." 
            class="input-box"
            rows="3"
          ></textarea>
          <button @click="sendMessage" class="send-button">
            发送
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.message-page {
  display: flex;
  height: calc(100vh - 140px);
  max-width: 1200px;
  margin: 20px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--bg-color);
}

/* 联系人面板 */
.contacts-panel {
  width: 300px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.contacts-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.contacts-header h2 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.contact-item:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.contact-item.selected {
  background-color: rgba(99, 102, 241, 0.15);
}

.contact-item.unread {
  background-color: rgba(99, 102, 241, 0.05);
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.follow-badge {
  font-size: 0.7rem;
  background-color: #6366f1;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

.contact-last-message,
.contact-status {
  font-size: 0.8rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-time {
  font-size: 0.7rem;
  opacity: 0.6;
  position: absolute;
  top: 12px;
  right: 20px;
}

/* 聊天面板 */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-name {
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-color);
}

.message-group {
  margin-bottom: 10px;
}

.date-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.date-divider span {
  background-color: var(--bg-color);
  padding: 0 10px;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  position: relative;
  z-index: 1;
}

.date-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
  z-index: 0;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  flex-shrink: 0;
}

.self-message {
  flex-direction: row-reverse;
}

.self-message .message-avatar {
  margin-right: 0;
  margin-left: 10px;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #f0f0f0;
  color: #333;
  word-break: break-word;
  line-height: 1.4;
}

.self-message .message-content {
  align-items: flex-end;
}

.self-message .message-text {
  background-color: #6366f1;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item:not(.self-message) .message-text {
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  margin-top: 5px;
  opacity: 0.7;
}

.message-input {
  padding: 15px 20px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
}

.input-box {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: none;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: inherit;
}

.send-button {
  padding: 0 20px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  align-self: flex-end;
  height: 40px;
}

.send-button:hover {
  background-color: #4f46e5;
}

/* 空状态 */
.no-chat-selected,
.empty-chat,
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color);
  opacity: 0.7;
  text-align: center;
  padding: 20px;
}

.empty-chat-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-page {
    flex-direction: column;
    height: calc(100vh - 100px);
  }
  
  .contacts-panel {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .contacts-list {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .contact-item {
    flex-direction: column;
    width: 80px;
    text-align: center;
    padding: 10px;
    border-bottom: none;
  }
  
  .contact-avatar {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .contact-status {
    display: none;
  }
}
</style>
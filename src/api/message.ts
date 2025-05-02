import { ref, reactive } from 'vue';

// 消息类型定义
export interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  send_time: string;
  is_self?: boolean;
}

// 联系人类型定义
export interface Contact {
  uuid: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount: number;
  isFollowed: boolean;
}

// 存储所有消息，按照对话分组
// 格式: { 'contact_uuid': Message[] }
const messageStore = reactive<Record<string, Message[]>>({});

// 存储所有联系人
const contacts = ref<Contact[]>([]);

// 当前选中的联系人ID
const currentContactId = ref<string | null>(null);

// 初始化消息存储
export function initMessageStore() {
  // 尝试从localStorage加载消息
  try {
    const savedMessages = localStorage.getItem('message_store');
    if (savedMessages) {
      Object.assign(messageStore, JSON.parse(savedMessages));
    }
    
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      contacts.value = JSON.parse(savedContacts);
    }
  } catch (error) {
    console.error('加载消息失败:', error);
  }
}

// 保存消息到localStorage
function saveToStorage() {
  try {
    localStorage.setItem('message_store', JSON.stringify(messageStore));
    localStorage.setItem('contacts', JSON.stringify(contacts.value));
  } catch (error) {
    console.error('保存消息失败:', error);
  }
}

// 添加或更新联系人
export function addOrUpdateContact(contactId: string, data: Partial<Contact> = {}) {
  const existingIndex = contacts.value.findIndex(c => c.uuid === contactId);
  
  if (existingIndex >= 0) {
    // 更新现有联系人
    contacts.value[existingIndex] = {
      ...contacts.value[existingIndex],
      ...data,
      unreadCount: data.unreadCount !== undefined ? 
        data.unreadCount : contacts.value[existingIndex].unreadCount
    };
  } else {
    // 添加新联系人
    contacts.value.push({
      uuid: contactId,
      nickname: data.nickname || '未知用户',
      avatar: data.avatar || '',
      bio: data.bio || '',
      unreadCount: data.unreadCount || 0,
      isFollowed: data.isFollowed || false
    });
  }
  
  // 按最后消息时间排序
  sortContactsByLastMessage();
  saveToStorage();
}

// 按最后消息时间排序联系人
function sortContactsByLastMessage() {
  contacts.value.sort((a, b) => {
    const aTime = a.lastTime ? new Date(a.lastTime).getTime() : 0;
    const bTime = b.lastTime ? new Date(b.lastTime).getTime() : 0;
    return bTime - aTime; // 降序，最新的在前面
  });
}

// 添加消息
export function addMessage(message: Message) {
  const contactId = message.is_self ? message.receiver_id : message.sender_id;
  
  // 确保该联系人的消息数组存在
  if (!messageStore[contactId]) {
    messageStore[contactId] = [];
  }
  
  // 添加消息
  messageStore[contactId].push(message);
  
  // 更新联系人的最后消息
  const lastMessageInfo = {
    lastMessage: message.content,
    lastTime: message.send_time
  };
  
  // 如果不是当前选中的联系人，增加未读计数
  if (contactId !== currentContactId.value && !message.is_self) {
    const contact = contacts.value.find(c => c.uuid === contactId);
    const unreadCount = contact ? contact.unreadCount + 1 : 1;
    addOrUpdateContact(contactId, { ...lastMessageInfo, unreadCount });
  } else {
    addOrUpdateContact(contactId, lastMessageInfo);
  }
  
  saveToStorage();
}

// 获取与特定联系人的所有消息
export function getMessages(contactId: string): Message[] {
  return messageStore[contactId] || [];
}

// 设置当前联系人并清除未读计数
export function setCurrentContact(contactId: string | null) {
  currentContactId.value = contactId;
  
  if (contactId) {
    // 清除未读计数
    const contactIndex = contacts.value.findIndex(c => c.uuid === contactId);
    if (contactIndex >= 0) {
      contacts.value[contactIndex].unreadCount = 0;
      saveToStorage();
    }
  }
}

// 获取所有联系人
export function getContacts(): Contact[] {
  return contacts.value;
}

// 获取总未读消息数
export function getTotalUnreadCount(): number {
  return contacts.value.reduce((total, contact) => total + contact.unreadCount, 0);
}

// 从关注列表更新联系人
export function updateContactsFromFollowList(followList: any[]) {
  // 标记所有现有联系人为未关注
  contacts.value.forEach(contact => {
    contact.isFollowed = false;
  });
  
  // 更新或添加关注的用户
  followList.forEach(user => {
    addOrUpdateContact(user.uuid, {
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      isFollowed: true
    });
  });
  
  saveToStorage();
}

// 初始化
initMessageStore();
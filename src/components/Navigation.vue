<template>
  <header class="navigation" :class="{ 'dark-mode': isDarkMode }">
    <div class="nav-container">
      <div class="nav-left">
        <img src="../assets/imgs/video_web_logo.png" alt="Logo" class="logo" @click="router.push({name: 'Index'})"/>
        
        <ul class="nav-links">
          <li v-for="(link, index) in navLinks" :key="index">
            <a 
              :href="link.href" 
              :class="{ 'active': isActiveLink(link.href) }"
            >
              {{ link.text }}
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-button" @click="toggleMobileMenu">
        <span class="menu-icon">☰</span>
      </button>
      
      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="搜索视频..." 
            v-model="search_keyword" 
            @keyup.enter="goSearch(search_keyword)"
          />
          <button @click="goSearch(search_keyword)">
            <span class="search-icon">🔍</span>
          </button>
        </div>
      </div>

      <div class="nav-right">
        <!-- User Actions -->
        <ul class="user-actions">
          <li v-for="(action, index) in userActions" :key="index">
            <a 
              :href="action.href" 
              :class="{ 'active': isActiveLink(action.href) }"
            >
              <span class="action-icon">{{ getActionIcon(action.text) }}</span>
              <span class="action-text">{{ action.text }}</span>
            </a>
          </li>
          
          <!-- Theme Toggle -->
          <li>
            <button class="theme-toggle" @click="toggleTheme">
              {{ isDarkMode ? '☀️' : '🌙' }}
            </button>
          </li>
        </ul>
        
        <!-- User Avatar with Popover -->
        <n-popover
          trigger="hover"
          placement="bottom"
          :width="200"
          :style="{ padding: '0'}"
        >
          <!-- Popover Content -->
          <template #default>
            <div class="user-popover">
              <div class="user-info">
                <img :src="avatar_path" alt="User Avatar" class="popover-avatar" />
                <div class="user-details">
                  <p class="user-name">{{ username }}</p>
                  <p class="user-status">{{ UserManager.isLogin() ? '已登录' : '未登录' }}</p>
                </div>
              </div>
              
              <div class="popover-actions">
                <button class="popover-button" @click="go_user_page">
                  {{ UserManager.isLogin() ? '个人中心' : '登录/注册' }}
                </button>
                <button 
                  v-if="UserManager.isLogin()" 
                  class="popover-button logout-button" 
                  @click="logout"
                >
                  登出
                </button>
              </div>
            </div>
          </template>
          
          <!-- Avatar Trigger -->
          <template #trigger>
            <div class="user-avatar" @click="go_user_page">
              <img :src="avatar_path" alt="User Avatar" />
            </div>
          </template>
        </n-popover>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" v-if="mobileMenuOpen">
      <ul class="mobile-nav-links">
        <li v-for="(link, index) in navLinks" :key="index">
          <a 
            :href="link.href" 
            :class="{ 'active': isActiveLink(link.href) }"
          >
            {{ link.text }}
          </a>
        </li>
      </ul>
      
      <ul class="mobile-user-actions">
        <li v-for="(action, index) in userActions" :key="index">
          <a 
            :href="action.href" 
            :class="{ 'active': isActiveLink(action.href) }"
          >
            <span class="action-icon">{{ getActionIcon(action.text) }}</span>
            {{ action.text }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NPopover } from "naive-ui";
import { UserManager } from "../api/user";
import { global } from "../api/global";

const router = useRouter();
const route = useRoute();

// Theme state
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

// Mobile menu state
const mobileMenuOpen = ref(false);

const navLinks = [
  { text: '首页', href: '/' },
  { text: '热门', href: '/trending' },
  { text: '分类', href: '/categories' },
  { text: '关注', href: '/following' },
];

const userActions = [
  { text: '消息', href: '/messages' },
  { text: '收藏', href: '/favorites' },
  { text: '历史', href: '/history' },
  { text: '上传', href: '/upload' },
];

const username = ref(localStorage.getItem("video-web-golang-username") || "游客");
const search_keyword = ref("");

const avatar_path = computed(() => {
  if (UserManager.isLogin()) {
    return `${global.path}/user/get-avatar?user_id=` + localStorage.getItem("video-web-golang-uuid");
  }
  return `${window.location.protocol}//${window.location.host}/src/assets/imgs/default_user_avatar.png`;
});

const refresh_username = () => {
  username.value = localStorage.getItem("video-web-golang-username") || "游客";
};

const go_user_page = () => {
  if (!UserManager.isLogin()) {
    router.push({ name: "RegisterAndLogin" });
    return;
  }
  refresh_username();
  router.push({ name: 'Profile', params: { username: username.value } });
};

const logout = () => {
  localStorage.removeItem("video-web-golang-token");
  localStorage.removeItem("video-web-golang-uuid");
  localStorage.removeItem("video-web-golang-username");
  refresh_username();
  router.push('/');
};

const goSearch = (keyword: string) => {
  if (keyword === "") {
    return;
  }
  router.push({ name: 'Search', params: { keyword: keyword } });
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Toggle theme
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Check if link is active
const isActiveLink = (href: string) => {
  if (href === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(href);
};

// Get icon for user action
const getActionIcon = (text: string) => {
  switch (text) {
    case '消息': return '💬';
    case '关注': return '👥';
    case '收藏': return '⭐';
    case '历史': return '🕒';
    case '上传': return '📤';
    default: return '📌';
  }
};

// Initialize theme on mount
onMounted(() => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<style scoped>
.navigation {
  background-color: var(--box-bgc);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

/* Logo */
.logo {
  height: 40px;
  cursor: pointer;
  margin-right: 24px;
}

/* Left Navigation */
.nav-left {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-right: 24px;
}

.nav-links a {
  color: var(--fontNormal);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #6366f1;
}

.nav-links a.active {
  color: #6366f1;
}

.nav-links a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6366f1;
}

/* Search Bar */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.search-bar {
  display: flex;
  background-color: var(--content-bgc);
  border-radius: 50px;
  overflow: hidden;
  border: 1px solid var(--hover-color);
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.search-bar input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--fontNormal);
  font-size: 14px;
  outline: none;
}

.search-bar button {
  background: transparent;
  border: none;
  padding: 0 16px;
  color: var(--fontNormal);
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-bar button:hover {
  background-color: var(--hover-color);
}

/* Right Navigation */
.nav-right {
  display: flex;
  align-items: center;
}

.user-actions {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.user-actions li {
  margin-left: 16px;
}

.user-actions a {
  color: var(--fontNormal);
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-actions a:hover {
  background-color: var(--hover-color);
}

.user-actions a.active {
  color: #6366f1;
}

.action-icon {
  font-size: 16px;
}

/* Theme Toggle */
.theme-toggle {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--fontNormal);
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--hover-color);
}

/* User Avatar */
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-left: 16px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.user-avatar:hover {
  border-color: #6366f1;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Popover Content */
.user-popover {
  padding: 16px;
  background-color: var(--box-bgc);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.popover-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--fontNormal);
}

.user-status {
  font-size: 12px;
  margin: 0;
  color: #6b7280;
}

.popover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popover-button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  background-color: #6366f1;
  color: white;
  transition: background-color 0.2s;
}

.popover-button:hover {
  background-color: #4f46e5;
}

.logout-button {
  background-color: #ef4444;
}

.logout-button:hover {
  background-color: #dc2626;
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--fontNormal);
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  padding: 16px;
  background-color: var(--box-bgc);
  border-top: 1px solid var(--hover-color);
}

.mobile-nav-links,
.mobile-user-actions {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.mobile-nav-links li,
.mobile-user-actions li {
  margin-bottom: 12px;
}

.mobile-nav-links a,
.mobile-user-actions a {
  color: var(--fontNormal);
  text-decoration: none;
  font-size: 16px;
  display: block;
  padding: 8px 0;
}

.mobile-nav-links a.active,
.mobile-user-actions a.active {
  color: #6366f1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .action-text {
    display: none;
  }
  
  .search-container {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .user-actions {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
    order: 1;
  }
  
  .nav-container {
    flex-wrap: wrap;
  }
  
  .nav-left {
    order: 2;
    width: 100%;
    justify-content: space-between;
    margin-top: 12px;
  }
  
  .search-container {
    order: 3;
    max-width: none;
    width: 100%;
    margin: 12px 0 0 0;
  }
  
  .nav-right {
    order: 4;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .logo {
    margin-right: 0;
  }
  
  .user-avatar {
    margin-left: 0;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}
</style>
<template>
    <div class="following-page">
      <div class="page-header">
        <h1 class="page-title">我的关注</h1>
        <p class="page-subtitle">关注您喜欢的创作者，不错过任何精彩内容</p>
      </div>
  
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载关注列表...</p>
      </div>
  
      <!-- 空状态 -->
      <div v-else-if="following.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h2>您还没有关注任何人</h2>
        <p>关注您感兴趣的创作者，获取他们的最新动态</p>
        <button class="discover-btn" @click="goToDiscover">发现创作者</button>
      </div>
  
      <!-- 关注列表 -->
      <div v-else class="following-grid">
        <div 
          v-for="user in following" 
          :key="user.uuid" 
          class="following-card"
          @click="goToUserProfile(user)"
        >
          <div class="card-content">
            <div class="user-avatar">
              <img :src="getAvatarPath(user.avatar || '')" alt="用户头像">
            </div>
            
            <div class="user-info">
              <h3 class="user-name">{{ user.nickname }}</h3>
              <p class="user-stats">{{ formatCount(user.fan_num || 0) }} 粉丝</p>
              <p class="user-bio" v-if="user.description">{{ truncateBio(user.description) }}</p>
              <p class="user-bio" v-else>这个人很懒，什么都没留下~</p>
            </div>
          </div>
          
          <div class="card-actions">
            <button 
              class="follow-button" 
              @click.stop="toggleFollow(user)"
            >
              <span class="follow-icon">✓</span>
              已关注
            </button>
            <button class="message-button" @click.stop="sendMessage(user)">
              <span class="message-icon">✉️</span>
              私信
            </button>
          </div>
        </div>
      </div>
  
      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="p in displayedPages" 
            :key="p" 
            class="page-number"
            :class="{ active: page === p }"
            @click="changePage(Number(p))"
          >
            {{ p }}
          </button>
        </div>
        
        <button 
          class="page-btn" 
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { UserManager, getAvatarPath } from '../api/user.ts';
  import { useRouter } from 'vue-router';
  import follow_manager from '../api/follow.ts';
  import { User } from '../api/user';
  import { useMessage } from 'naive-ui';
  
  const router = useRouter();
  const message = useMessage();
  const following = ref<User[]>([]);
  const page = ref(1);
  const totalPages = ref(1);
  const loading = ref(true);
  const itemsPerPage = 12; // 每页显示的用户数量
  
  // 获取关注列表
  const getFollowing = async () => {
    try {
      loading.value = true;
      const res = await follow_manager.getFollowList(page.value);
      following.value = res;
      
      // 假设API返回的是当前页的数据，我们需要计算总页数
      // 如果API已经提供了总页数，可以直接使用
      // 这里假设我们需要自己计算
      const totalCount = res.length > 0 ? res.length : 0;
      totalPages.value = Math.ceil(totalCount / itemsPerPage);
    } catch (error) {
      console.error('获取关注列表失败:', error);
      message.error('获取关注列表失败，请稍后再试');
    } finally {
      loading.value = false;
    }
  };
  
  // 切换关注状态
  const toggleFollow = async (user: User) => {
    try {
      await follow_manager.updateFollow(user.uuid || "");
      message.success(`已取消关注 ${user.nickname}`);
      // 从列表中移除该用户
      following.value = following.value.filter(item => item.uuid !== user.uuid);
      
      // 如果当前页已经没有数据，且不是第一页，则返回上一页
      if (following.value.length === 0 && page.value > 1) {
        page.value--;
        getFollowing();
      }
    } catch (error) {
      console.error('取消关注失败:', error);
      message.error('操作失败，请稍后再试');
    }
  };
  
  // 发送私信
  const sendMessage = (user: User) => {
    message.info(`即将向 ${user.nickname} 发送私信`);
    // 这里可以跳转到私信页面或打开私信对话框
    // router.push(`/messages/${user.uuid}`);
  };
  
  // 跳转到用户主页
  const goToUserProfile = (user: User) => {
    router.push({ name: 'Profile', params: { username: user.nickname } });
  };
  
  // 跳转到发现页面
  const goToDiscover = () => {
    router.push('/discover');
  };
  
  // 格式化数字
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };
  
  // 截断过长的个人简介
  const truncateBio = (bio: string): string => {
    return bio.length > 60 ? bio.substring(0, 60) + '...' : bio;
  };
  
  // 计算要显示的页码
  const displayedPages = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;
  
    if (totalPages.value <= maxVisiblePages) {
      for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, page.value - 1);
      let endPage = Math.min(totalPages.value - 1, page.value + 1);
      
      if (page.value <= 3) {
        endPage = Math.min(totalPages.value - 1, maxVisiblePages - 1);
      } else if (page.value >= totalPages.value - 2) {
        startPage = Math.max(2, totalPages.value - (maxVisiblePages - 2));
      }
      
      if (startPage > 2) {
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages.value - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages.value);
    }
  
    return pages;
  });
  
  // 切换页码
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
      getFollowing();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  onMounted(() => {
    if (!UserManager.isLogin()) {
      router.push('/login');
      return;
    }
    getFollowing();
  });
  </script>
  
  <style scoped>
  .following-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--fontNormal);
  }
  
  /* 页面标题样式 */
  .page-header {
    margin-bottom: 32px;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--fontNormal);
    margin: 0 0 8px 0;
  }
  
  .page-subtitle {
    font-size: 1rem;
    color: var(--fontNormal);
    opacity: 0.7;
    margin: 0;
  }
  
  /* 加载状态 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: var(--fontNormal);
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--hover-color);
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
  
  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 80px 0;
    color: var(--fontNormal);
  }
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }
  
  .empty-state h2 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
  
  .empty-state p {
    font-size: 1rem;
    margin-bottom: 24px;
    color: var(--fontNormal);
    opacity: 0.7;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .discover-btn {
    padding: 12px 24px;
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .discover-btn:hover {
    background-color: #4f46e5;
  }
  
  /* 关注列表网格 */
  .following-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }
  
  /* 用户卡片 */
  .following-card {
    background-color: var(--box-bgc);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--box-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
  
  .following-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--boxHoverShadow);
  }
  
  .card-content {
    padding: 20px;
    display: flex;
    gap: 16px;
    flex: 1;
  }
  
  .user-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #6366f1;
    flex-shrink: 0;
  }
  
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .user-info {
    flex: 1;
    min-width: 0;
  }
  
  .user-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--fontNormal);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-stats {
    font-size: 0.9rem;
    color: var(--fontNormal);
    opacity: 0.7;
    margin: 0 0 8px 0;
  }
  
  .user-bio {
    font-size: 0.85rem;
    color: var(--fontNormal);
    opacity: 0.8;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-actions {
    display: flex;
    padding: 12px 20px;
    background-color: rgba(0, 0, 0, 0.03);
    border-top: 1px solid var(--hover-color);
  }
  
  .follow-button,
  .message-button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }
  
  .follow-button {
    background-color: var(--hover-color);
    color: var(--fontNormal);
    margin-right: 8px;
    flex: 1;
    justify-content: center;
  }
  
  .follow-button:hover {
    background-color: #ef4444;
    color: white;
  }
  
  .message-button {
    background-color: transparent;
    color: var(--fontNormal);
    border: 1px solid var(--hover-color);
  }
  
  .message-button:hover {
    background-color: var(--hover-color);
  }
  
  .follow-icon,
  .message-icon {
    font-size: 0.9rem;
  }
  
  /* 分页控件 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    gap: 8px;
  }
  
  .page-btn {
    padding: 8px 16px;
    border: 1px solid var(--hover-color);
    background-color: var(--box-bgc);
    color: var(--fontNormal);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .page-btn:hover:not(:disabled) {
    background-color: var(--hover-color);
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-numbers {
    display: flex;
    gap: 8px;
  }
  
  .page-number {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid var(--hover-color);
    background-color: var(--box-bgc);
    color: var(--fontNormal);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .page-number:hover:not(.active) {
    background-color: var(--hover-color);
  }
  
  .page-number.active {
    background-color: #6366f1;
    color: white;
    border-color: #6366f1;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .following-page {
      padding: 20px 16px;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .following-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }
    
    .card-content {
      padding: 16px;
    }
    
    .user-avatar {
      width: 56px;
      height: 56px;
    }
  }
  
  @media (max-width: 480px) {
    .following-grid {
      grid-template-columns: 1fr;
    }
    
    .card-content {
      flex-direction: row;
      align-items: center;
    }
    
    .pagination {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  </style>
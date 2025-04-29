<template>
    <div class="history-page">
      <div class="history-header">
        <h1 class="page-title">观看历史</h1>
        <div class="header-actions">
          <div class="filter-container" v-if="video_list.length > 0">
            <select v-model="sortOption" class="sort-select">
              <option value="recent">最近观看</option>
              <option value="popular">最受欢迎</option>
              <option value="title">标题排序</option>
            </select>
          </div>
          <button 
            v-if="video_list.length > 0" 
            class="clear-history-btn" 
            @click="confirmClearHistory"
          >
            清空历史记录
          </button>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="video_list.length === 0" class="empty-state">
        <div class="empty-icon">📺</div>
        <h2>暂无观看历史</h2>
        <p>您还没有观看过任何视频，去首页发现精彩内容吧！</p>
        <button class="discover-btn" @click="goToHomePage">发现视频</button>
      </div>
  
      <!-- History Timeline -->
      <div v-else class="history-timeline">
        <div v-for="(group, date) in groupedVideos" :key="date" class="history-day">
          <div class="day-header">
            <h2 class="day-title">{{ formatDate(date) }}</h2>
            <div class="day-divider"></div>
          </div>
          
          <VideoGrid :videos="group" class="video-grid" />
        </div>
      </div>
  
      <!-- Pagination -->
      <div v-if="video_list.length > 0 && totalPages > 1" class="pagination">
        <button 
          class="page-btn prev" 
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="pageNum in displayedPages" 
            :key="pageNum" 
            class="page-number" 
            :class="{ active: page === pageNum }"
            @click="changePage(Number(pageNum))"
          >
            {{ pageNum }}
          </button>
        </div>
        
        <button 
          class="page-btn next" 
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          下一页
        </button>
      </div>
  
      <!-- Clear History Confirmation Modal -->
      <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
        <div class="modal-content" @click.stop>
          <h3>确认清空历史记录？</h3>
          <p>此操作将删除您的所有观看历史，且不可恢复。</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showClearConfirm = false">取消</button>
            <button class="confirm-btn" @click="clearHistory">确认清空</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { UserManager } from '../api/user';
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from 'vue-router';
  import VideoGrid from '../components/VideoGrid.vue';
  import { myVideoManager, myVideo } from '../api/myVideo';
  import { useMessage } from 'naive-ui';
  // State
  const router = useRouter();
  const user_manager = new UserManager();
  const my_video_manager = new myVideoManager();
  const page = ref(1);
  const totalPages = ref(1);
  const loading = ref(true);
  const video_list = ref<myVideo[]>([]);
  const sortOption = ref('recent');
  const showClearConfirm = ref(false);
  const message = useMessage();
  // Fetch history data
  const fetchHistory = async (pageNum: number) => {
    try {
      loading.value = true;
      const history_list = await user_manager.getHistoryList(pageNum);
      
      // Assuming the API returns total pages info, otherwise estimate
      // This is a placeholder - adjust based on your actual API
      totalPages.value = Math.ceil(history_list.length / 20) || 1;
      
      video_list.value = await my_video_manager.getVideoListByIds(history_list);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Group videos by date
  const groupedVideos = computed(() => {
    const sorted = [...video_list.value].sort((a, b) => {
      if (sortOption.value === 'recent') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortOption.value === 'popular') {
        return b.get_num - a.get_num;
      } else { // title
        return a.title.localeCompare(b.title);
      }
    });
  
    const groups: Record<string, myVideo[]> = {};
    
    sorted.forEach(video => {
      const date = new Date(video.updated_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(video);
    });
    
    return groups;
  });
  
  // Calculate displayed page numbers
  const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = page.value;
    const pages = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Show dots if current page is more than 3
      if (current > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Show dots if current page is less than total - 2
      if (current < total - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(total);
    }
    
    return pages;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };
  
  // Change page
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
      fetchHistory(newPage);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Navigate to home page
  const goToHomePage = () => {
    router.push('/');
  };
  
  // Show clear history confirmation
  const confirmClearHistory = () => {
    showClearConfirm.value = true;
  };
  
  // Clear history
  const clearHistory = async () => {
    //TODO 清空历史记录
    try {
      loading.value = true;
      message.success('功能开发中');
      // Assuming there's a clearHistory method in UserManager
      // If not, you'll need to implement this API call
    //   const success = await user_manager.clearHistory();
      
    //   if (success) {
    //     video_list.value = [];
    //     showClearConfirm.value = false;
    //   }
    } catch (error) {
      console.error('Failed to clear history:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Fetch data on mount
  onMounted(() => {
    fetchHistory(page.value);
  });
  </script>
  
  <style scoped>
  .history-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 80vh;
  }
  
  /* Header Styles */
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--fontNormal);
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .filter-container {
    position: relative;
  }
  
  .sort-select {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--hover-color);
    background-color: var(--box-bgc);
    color: var(--fontNormal);
    font-size: 14px;
    cursor: pointer;
    appearance: none;
    padding-right: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  
  .clear-history-btn {
    padding: 10px 16px;
    border-radius: 8px;
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .clear-history-btn:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }
  
  /* Loading State */
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
  
  /* Empty State */
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
  
  /* History Timeline */
  .history-timeline {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .history-day {
    margin-bottom: 20px;
  }
  
  .day-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .day-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--fontNormal);
    margin: 0;
    white-space: nowrap;
    margin-right: 16px;
  }
  
  .day-divider {
    flex: 1;
    height: 1px;
    background-color: var(--hover-color);
  }
  
  .video-grid {
    margin-top: 16px;
  }
  
  /* Pagination */
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
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: var(--box-bgc);
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .modal-content h3 {
    margin-top: 0;
    color: var(--fontNormal);
  }
  
  .modal-content p {
    color: var(--fontNormal);
    opacity: 0.8;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  .cancel-btn {
    padding: 10px 16px;
    border-radius: 6px;
    background-color: var(--hover-color);
    color: var(--fontNormal);
    border: none;
    cursor: pointer;
  }
  
  .confirm-btn {
    padding: 10px 16px;
    border-radius: 6px;
    background-color: #ef4444;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .history-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .header-actions {
      width: 100%;
      justify-content: space-between;
    }
    
    .pagination {
      flex-wrap: wrap;
    }
  }
  
  @media (max-width: 480px) {
    .history-page {
      padding: 20px 16px;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .header-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .sort-select, 
    .clear-history-btn {
      width: 100%;
    }
  }
  </style>
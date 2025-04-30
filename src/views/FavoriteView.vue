<template>
    <div class="favorites-page">
      <div class="favorites-header">
        <div class="header-content">
          <h1 class="page-title">我的收藏</h1>
          <p class="page-subtitle">您收藏的精彩内容都在这里</p>
        </div>
        
        <div class="header-actions" v-if="videoList.length > 0">
          <div class="search-filter">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索收藏..." 
              class="search-input"
            />
            <select v-model="sortOption" class="sort-select">
              <option value="recent">最近收藏</option>
              <option value="popular">最受欢迎</option>
              <option value="title">标题排序</option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载您的收藏...</p>
      </div>
  
      <!-- Empty State -->
      <div v-else-if="videoList.length === 0" class="empty-state">
        <div class="empty-icon">⭐</div>
        <h2>暂无收藏内容</h2>
        <p>您还没有收藏任何视频，去发现一些精彩内容吧！</p>
        <button class="discover-btn" @click="goToHomePage">发现视频</button>
      </div>
  
      <!-- Content with Filters -->
      <div v-else class="favorites-content">
        <!-- Categories/Tags Filter -->
        <div class="categories-filter">
          <button 
            class="category-tag" 
            :class="{ active: activeCategory === 'all' }"
            @click="activeCategory = 'all'"
          >
            全部
          </button>
          <button 
            v-for="category in uniqueCategories" 
            :key="category"
            class="category-tag"
            :class="{ active: activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
  
        <!-- Results Stats -->
        <div class="results-stats">
          <p>
            {{ filteredVideos.length }} 个视频
            <span v-if="searchQuery || activeCategory !== 'all'">
              (筛选自 {{ videoList.length }} 个收藏)
            </span>
          </p>
          
          <button 
            v-if="selectedVideos.length > 0" 
            class="batch-action-btn"
            @click="confirmRemoveFavorites"
          >
            移除选中 ({{ selectedVideos.length }})
          </button>
        </div>
  
        <!-- Selection Mode Toggle -->
        <div class="selection-toggle">
          <label class="toggle-label">
            <input type="checkbox" v-model="selectionMode">
            <span>批量管理</span>
          </label>
        </div>
  
        <!-- Video Grid with Selection -->
        <div class="video-grid-container">
          <div v-if="selectionMode" class="selection-grid">
            <div 
              v-for="video in filteredVideos" 
              :key="video.uuid"
              class="video-selection-item"
            >
              <label class="selection-checkbox">
                <input 
                  type="checkbox" 
                  :value="video.uuid" 
                  v-model="selectedVideos"
                >
                <span class="checkmark"></span>
              </label>
              <div class="video-card">
                <VideoGrid :videos="[video]" />
              </div>
            </div>
          </div>
          <VideoGrid v-else :videos="filteredVideos" />
        </div>
  
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="changePage(Number(page))"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
  
      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
        <div class="modal-content" @click.stop>
          <h3>确认移除收藏</h3>
          <p>您确定要移除选中的 {{ selectedVideos.length }} 个视频收藏吗？</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showConfirmModal = false">取消</button>
            <button class="confirm-btn" @click="removeFavorites">确认移除</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import favorite_manager, { Favorite } from '../api/favorite';
  import my_video_manager, { myVideo } from '../api/myVideo';
  import { useMessage } from 'naive-ui';
  import VideoGrid from '../components/VideoGrid.vue';
  
  const router = useRouter();
  const message = useMessage();
  
  // State
  const favoriteList = ref<Favorite[]>([]);
  const videoList = ref<myVideo[]>([]);
  const loading = ref(true);
  const searchQuery = ref('');
  const sortOption = ref('recent');
  const activeCategory = ref('all');
  const currentPage = ref(1);
  const itemsPerPage = 12;
  const selectionMode = ref(false);
  const selectedVideos = ref<string[]>([]);
  const showConfirmModal = ref(false);
  
  // Fetch favorites and videos
  const getFavoriteList = async () => {
    try {
      loading.value = true;
      const res = await favorite_manager.getFavoriteList();
      favoriteList.value = res.favorite_list || [];
      
      if (favoriteList.value.length > 0) {
        const videoIds: object[] = [];
        for (let i = 0; i < favoriteList.value.length; i++) {
          videoIds.push({video_id: favoriteList.value[i].video_id});
        }
        videoList.value = await my_video_manager.getVideoListByIds(videoIds);
      } else {
        videoList.value = [];
      }
    } catch (error) {
      console.error(error);
      message.error("获取收藏列表失败");
      videoList.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  // Get unique categories from videos
  const uniqueCategories = computed(() => {
    const categories = videoList.value.map(video => video.type).filter(Boolean);
    return [...new Set(categories)];
  });
  
  // Filter and sort videos
  const filteredVideos = computed(() => {
    let result = [...videoList.value];
    
    // Filter by category
    if (activeCategory.value !== 'all') {
      result = result.filter(video => video.type === activeCategory.value);
    }
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(query) || 
        (video.description && video.description.toLowerCase().includes(query))
      );
    }
    
    // Sort videos
    if (sortOption.value === 'recent') {
      result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortOption.value === 'popular') {
      result.sort((a, b) => b.get_num - a.get_num);
    } else if (sortOption.value === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return result;
  });
  
  // Pagination
  const totalPages = computed(() => {
    return Math.ceil(filteredVideos.value.length / itemsPerPage);
  });
  
//   const paginatedVideos = computed(() => {
//     const start = (currentPage.value - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     return filteredVideos.value.slice(start, end);
//   });
  
  const displayedPages = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages.value <= maxVisiblePages) {
      for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage.value - 1);
      let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);
      
      if (currentPage.value <= 3) {
        endPage = Math.min(totalPages.value - 1, maxVisiblePages - 1);
      } else if (currentPage.value >= totalPages.value - 2) {
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
  
  // Change page
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Navigate to home page
  const goToHomePage = () => {
    router.push('/');
  };
  
  // Confirm remove favorites
  const confirmRemoveFavorites = () => {
    if (selectedVideos.value.length > 0) {
      showConfirmModal.value = true;
    }
  };
  
  // Remove favorites
  const removeFavorites = async () => {
    try {
      loading.value = true;
      message.error("功能开发中，敬请期待");
      // Assuming your API supports batch removal
      // If not, you'll need to loop through and remove one by one
    // for (const videoId of selectedVideos.value) {
    //     await favorite_manager.removeFavorite(videoId);
    // }
      
    //   message.success(`成功移除 ${selectedVideos.value.length} 个收藏`);
    //   selectedVideos.value = [];
    //   showConfirmModal.value = false;
      
      // Refresh the list
      await getFavoriteList();
    } catch (error) {
    //   console.error(error);
    //   message.error("移除收藏失败");
    message.error("功能开发中，敬请期待");
    } finally {
      loading.value = false;
    }
  };
  
  // Reset selection when exiting selection mode
//   const resetSelection = () => {
//     if (!selectionMode.value) {
//       selectedVideos.value = [];
//     }
//   };
  
  // Watch for changes in selection mode
  watch(() => selectionMode.value, (newVal) => {
    if (!newVal) {
      selectedVideos.value = [];
    }
  });
  
  // Initialize
  onMounted(() => {
    getFavoriteList();
  });
  </script>
  
  <style scoped>
  .favorites-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  /* Header Styles */
  .favorites-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .header-content {
    flex: 1;
    min-width: 200px;
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
  
  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .search-filter {
    display: flex;
    gap: 12px;
  }
  
  .search-input {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--hover-color);
    background-color: var(--box-bgc);
    color: var(--fontNormal);
    font-size: 14px;
    min-width: 200px;
  }
  
  .sort-select {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--hover-color);
    background-color: var(--box-bgc);
    color: var(--fontNormal);
    font-size: 14px;
    cursor: pointer;
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
  
  /* Categories Filter */
  .categories-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }
  
  .category-tag {
    padding: 8px 16px;
    border-radius: 20px;
    background-color: var(--box-bgc);
    border: 1px solid var(--hover-color);
    color: var(--fontNormal);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .category-tag:hover {
    background-color: var(--hover-color);
  }
  
  .category-tag.active {
    background-color: #6366f1;
    color: white;
    border-color: #6366f1;
  }
  
  /* Results Stats */
  .results-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    color: var(--fontNormal);
    font-size: 14px;
  }
  
  .batch-action-btn {
    padding: 8px 16px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .batch-action-btn:hover {
    background-color: #dc2626;
  }
  
  /* Selection Mode */
  .selection-toggle {
    margin-bottom: 20px;
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fontNormal);
    font-size: 14px;
    cursor: pointer;
  }
  
  .toggle-label input {
    margin: 0;
  }
  
  .selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .video-selection-item {
    position: relative;
  }
  
  .selection-checkbox {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    display: block;
    width: 24px;
    height: 24px;
  }
  
  .selection-checkbox input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
  }
  
  .selection-checkbox:hover input ~ .checkmark {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .selection-checkbox input:checked ~ .checkmark {
    background-color: #6366f1;
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }
  
  .selection-checkbox input:checked ~ .checkmark:after {
    display: block;
  }
  
  .selection-checkbox .checkmark:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
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
    .favorites-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-filter {
      flex-direction: column;
      width: 100%;
    }
    
    .search-input,
    .sort-select {
      width: 100%;
    }
    
    .categories-filter {
      overflow-x: auto;
      padding-bottom: 10px;
      flex-wrap: nowrap;
    }
    
    .category-tag {
      white-space: nowrap;
    }
    
    .results-stats {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
  
  @media (max-width: 480px) {
    .favorites-page {
      padding: 20px 16px;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .pagination {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  </style>
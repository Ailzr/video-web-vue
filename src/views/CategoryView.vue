<template>
    <div class="category-page">
      <!-- 分类头部 -->
      <div class="category-header">
        <h1 class="title">视频分类</h1>
        <p class="subtitle">探索不同类型的精彩视频内容</p>
      </div>
  
      <!-- 分类选择区域 -->
      <div class="category-tabs">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-tab"
          :class="{ 'active': selectedCategory?.id === category.id }"
          @click.stop="selectCategory(category)"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>
  
      <!-- 当前分类信息 -->
      <div class="current-category" v-if="selectedCategory">
        <div class="category-info">
          <div class="category-icon-large">{{ selectedCategory.icon }}</div>
          <div class="category-details">
            <h2 class="category-title">{{ selectedCategory.name }}</h2>
            <p class="category-description">{{ selectedCategory.description }}</p>
          </div>
        </div>
      </div>
  
      <!-- 视频内容区域 -->
      <div class="content-section">
        <div v-if="loading && page === 1" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <template v-else>
          <VideoGrid 
            :videos="videoList" 
            :editable="false" 
            v-if="videoList.length" 
          />
          
          <div v-else class="empty-state">
            <div class="empty-icon">🎬</div>
            <h3 class="empty-title">暂无视频</h3>
            <p class="empty-description">
              该分类下暂时没有视频内容，请稍后再来查看或浏览其他分类。
            </p>
          </div>
        </template>
      </div>
  
      <!-- 分页区域 -->
      <div class="pagination-section" v-if="videoList.length > 0">
        <div v-if="loading && page > 1" class="loading-more">
          <div class="loading-spinner small"></div>
          <span>加载更多视频中...</span>
        </div>
        <button 
          v-else-if="hasMore" 
          @click="loadVideos" 
          class="load-more-button"
        >
          加载更多视频
        </button>
        <p v-else class="no-more">没有更多视频了</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import VideoGrid from "../components/VideoGrid.vue";
  import my_video_manager, { myVideo } from "../api/myVideo";
  import { useMessage } from "naive-ui";
  
  // 定义分类接口
  interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
  }
  
  const router = useRouter();
  const route = useRoute();
  const message = useMessage();
  
  // 状态变量
  const categories = ref<Category[]>([
    { 
      id: "entertainment", 
      name: "娱乐", 
      icon: "🎭", 
      description: "包含各类娱乐节目、综艺、搞笑视频等轻松有趣的内容" 
    },
    { 
      id: "gaming", 
      name: "游戏", 
      icon: "🎮", 
      description: "游戏实况、攻略、解说和电子竞技相关的视频内容" 
    },
    { 
      id: "education", 
      name: "教育", 
      icon: "📚", 
      description: "涵盖各类学习教程、知识分享、讲座和教育资源" 
    },
    { 
      id: "technology", 
      name: "科技", 
      icon: "💻", 
      description: "最新科技资讯、产品评测、科技趋势和数码内容" 
    },
    { 
      id: "music", 
      name: "音乐", 
      icon: "🎵", 
      description: "音乐视频、MV、演唱会、乐器演奏和音乐教学" 
    },
    { 
      id: "sports", 
      name: "体育", 
      icon: "⚽", 
      description: "体育赛事、健身教程、运动技巧和体育资讯" 
    },
    { 
      id: "cooking", 
      name: "美食", 
      icon: "🍳", 
      description: "烹饪教程、美食探店、食谱分享和饮食文化" 
    },
    { 
      id: "travel", 
      name: "旅游", 
      icon: "✈️", 
      description: "旅行vlog、景点介绍、旅游攻略和文化体验" 
    },
    { 
      id: "fashion", 
      name: "时尚", 
      icon: "👗", 
      description: "时尚穿搭、美妆教程、潮流趋势和时尚资讯" 
    },
    { 
      id: "animation", 
      name: "动画", 
      icon: "🎨", 
      description: "动画作品、动漫资讯、二次元文化和创作分享" 
    }
  ]);
  
  const selectedCategory = ref<Category | null>(null);
  const videoList = ref<myVideo[]>([]);
  const page = ref(1);
  const loading = ref(true);
  const hasMore = ref(true);
  const isProcessingClick = ref(false); // 添加点击处理状态
  
  // 从路由参数获取分类ID
  const getCategoryIdFromRoute = (): string => {
    return route.params.categoryId as string || route.query.category as string || "entertainment";
  };
  
  // 根据ID查找分类
  const findCategoryById = (id: string): Category | undefined => {
    return categories.value.find(category => category.id === id);
  };
  
  // 选择分类
  const selectCategory = async (category: Category) => {
    // 防止重复点击或处理中的点击
    if (isProcessingClick.value || selectedCategory.value?.id === category.id) return;
    
    try {
      isProcessingClick.value = true;
      
    //   console.log("选择分类:", category.name); // 调试日志
      
      // 更新URL
      await router.push({
        name: 'Category',
        params: { categoryId: category.id }
      });
      
      // 确保DOM更新后再重置状态
      await nextTick();
      
      // 重置状态并加载新分类的视频
      resetAndLoadVideos(category);
    } catch (error) {
      console.error("分类切换失败:", error);
      message.error("分类切换失败，请重试");
    } finally {
      // 延迟重置处理状态，防止快速点击
      setTimeout(() => {
        isProcessingClick.value = false;
      }, 300);
    }
  };
  
  // 重置状态并加载视频
  const resetAndLoadVideos = (category: Category) => {
    selectedCategory.value = category;
    videoList.value = [];
    page.value = 1;
    loading.value = true;
    hasMore.value = true;
    loadVideos();
  };
  
  // 加载视频
  const loadVideos = async () => {
    if (!selectedCategory.value) return;
    
    loading.value = true;
    try {
      // 使用 try-catch 包装 API 调用，以防 API 不存在
      let videos: myVideo[] = [];
      
      try {
        videos = await my_video_manager.getVideoListByCategory(
          selectedCategory.value.id, 
          page.value
        );
      } catch (apiError) {
        console.warn("getVideoListByCategory 方法不存在，使用模拟数据");
        // 模拟数据，实际应用中应替换为真实 API
        videos = await simulateGetVideosByCategory(selectedCategory.value.id, page.value);
      }
      
      if (videos.length === 0) {
        hasMore.value = false;
        loading.value = false;
        return;
      }
      
      // 过滤掉重复的视频
      const existingIds = new Set(videoList.value.map(video => video.uuid));
      const filteredVideos = videos.filter((video: myVideo) => !existingIds.has(video.uuid));
      
      videoList.value.push(...filteredVideos);
      page.value++;
    } catch (error) {
      console.error("加载视频失败:", error);
      message.error("加载视频失败，请稍后重试");
    } finally {
      loading.value = false;
    }
  };
  
  // 模拟获取分类视频的函数
  const simulateGetVideosByCategory = async (categoryId: string, page: number): Promise<myVideo[]> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // 尝试获取所有视频
      const allVideos = await my_video_manager.getVideoList(1);
      if (!allVideos || !Array.isArray(allVideos)) {
        return [];
      }
      
      // 模拟分类过滤
      const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
      const filteredVideos = allVideos.filter((index: number) => {
        return index % categories.value.length === categoryIndex;
      });
      
      // 分页
      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return filteredVideos.slice(start, end);
    } catch (error) {
      console.error("模拟获取视频失败:", error);
      return [];
    }
  };
  
  // 初始化
  const initializeCategory = () => {
    const categoryId = getCategoryIdFromRoute();
    const category = findCategoryById(categoryId);
    
    if (category) {
      resetAndLoadVideos(category);
    } else if (categories.value.length > 0) {
      // 如果找不到指定分类，使用第一个分类
      resetAndLoadVideos(categories.value[0]);
    }
  };
  
  // 监听路由变化
  watch(
    () => route.params.categoryId,
    (newCategoryId) => {
    //   console.log("路由参数变化:", oldCategoryId, "->", newCategoryId); // 调试日志
      if (newCategoryId && newCategoryId !== selectedCategory.value?.id) {
        const category = findCategoryById(newCategoryId as string);
        if (category) {
          resetAndLoadVideos(category);
        }
      }
    },
    { immediate: true }
  );
  
  onMounted(() => {
    // console.log("组件挂载，初始化分类"); // 调试日志
    initializeCategory();
  });
  </script>
  
  <style scoped>
  .category-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px;
    color: #333;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* 分类头部 */
  .category-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--fontNormal);
  }
  
  .subtitle {
    font-size: 18px;
    color: var(--fontNormal);
    margin: 0;
  }
  
  /* 分类选择区域 */
  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 32px;
    justify-content: center;
  }
  
  .category-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: var(--background);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border-color, #e5e7eb);
    user-select: none; /* 防止文本选择 */
    position: relative; /* 添加相对定位 */
    z-index: 1; /* 确保在正常流中 */
  }
  
  .category-tab:hover {
    background-color: #f5f3ff;
    border-color: #6366f1;
  }
  
  .category-tab.active {
    background-color: #6366f1;
    color: white;
    border-color: #6366f1;
  }
  
  /* 添加点击效果 */
  .category-tab:active {
    transform: scale(0.98);
  }
  
  .category-icon {
    font-size: 18px;
  }
  
  .category-name {
    font-weight: 500;
  }
  
  /* 当前分类信息 */
  .current-category {
    margin-bottom: 32px;
    background-color: var(--background);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .category-info {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .category-icon-large {
    font-size: 48px;
    background-color: #f5f3ff;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    flex-shrink: 0;
  }
  
  .category-details {
    flex: 1;
  }
  
  .category-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--fontNormal);
  }
  
  .category-description {
    font-size: 16px;
    color: var(--fontNormal);
    margin: 0;
    line-height: 1.5;
  }
  
  /* 内容区域 */
  .content-section {
    min-height: 300px;
  }
  
  /* 空状态 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: var(--background);
    border-radius: 12px;
    text-align: center;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--fontNormal);
  }
  
  .empty-description {
    font-size: 16px;
    color: var(--fontNormal);
    max-width: 400px;
    margin: 0;
  }
  
  /* 加载状态 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #6b7280;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-spinner.small {
    width: 20px;
    height: 20px;
    border-width: 2px;
    margin-bottom: 0;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    padding: 12px;
  }
  
  /* 分页区域 */
  .pagination-section {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
  
  .load-more-button {
    background-color: white;
    color: #6366f1;
    border: 1px solid #6366f1;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .load-more-button:hover {
    background-color: #f5f3ff;
  }
  
  .no-more {
    color: #9ca3af;
    font-size: 14px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .category-tabs {
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 8px;
      justify-content: flex-start;
      -webkit-overflow-scrolling: touch;
    }
    
    .category-tab {
      flex-shrink: 0;
    }
    
    .category-info {
      flex-direction: column;
      text-align: center;
    }
    
    .category-icon-large {
      margin: 0 auto 16px;
    }
    
    .title {
      font-size: 28px;
    }
    
    .subtitle {
      font-size: 16px;
    }
  }
  
  @media (max-width: 480px) {
    .category-page {
      padding: 24px 16px;
    }
    
    .title {
      font-size: 24px;
    }
    
    .category-tab {
      padding: 8px 12px;
      font-size: 14px;
    }
    
    .category-icon {
      font-size: 16px;
    }
    
    .category-title {
      font-size: 20px;
    }
    
    .category-description {
      font-size: 14px;
    }
  }
  </style>
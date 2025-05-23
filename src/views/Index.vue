<template>
  <div class="home-page">

    <!-- Featured Section -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">推荐视频</h2>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <VideoGrid v-else :videos="videos" />
      
      <div class="load-more" v-if="videos.length > 0 && !loading">
        <button @click="loadMoreVideos" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-header">
        <h2 class="section-title">热门分类</h2>
      </div>
      
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
          @click="navigateToCategory(category.id)"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <h3 class="category-name">{{ category.name }}</h3>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import my_video_manager, { myVideo } from "../api/myVideo.ts";
import { UserManager } from "../api/user.ts";
import VideoGrid from "../components/VideoGrid.vue";

const router = useRouter();
const user_manager = new UserManager();

// Theme state
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

// Search functionality
// const searchQuery = ref('');

// Video loading state
const videos = ref<myVideo[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const currentPage = ref(1);

// Categories
const categories = ref([
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

// Load initial videos
const loadVideos = async () => {
  try {
    loading.value = true;
    videos.value = await my_video_manager.getVideoList(1);
  } catch (error) {
    console.error('Failed to load videos:', error);
  } finally {
    loading.value = false;
  }
};

// Load more videos
const loadMoreVideos = async () => {
  try {
    loadingMore.value = true;
    currentPage.value++;
    const moreVideos = await my_video_manager.getVideoList(currentPage.value);
    videos.value = [...videos.value, ...moreVideos];
  } catch (error) {
    console.error('Failed to load more videos:', error);
  } finally {
    loadingMore.value = false;
  }
};

// Navigate to category
const navigateToCategory = (categoryId: string) => {
  router.push({ name: 'Category', params: { categoryId: categoryId } });
};

// Refresh token and load videos on mount
onMounted(async () => {
  // 从 localStorage 读取主题状态
  isDarkMode.value = localStorage.getItem('theme') === 'dark';
  
  user_manager.refreshToken();
  await loadVideos();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 60px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-search {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-search input {
  flex: 1;
  padding: 16px 24px;
  border: none;
  font-size: 1rem;
  outline: none;
}

.hero-search button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0 24px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.hero-search button:hover {
  background: #4f46e5;
}

.search-icon {
  font-size: 1.2rem;
}

/* Content Section */
.content-section {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--fontNormal);
  margin: 0;
  margin-top: 20px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--hover-color);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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

/* Load More */
.load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more button {
  background-color: var(--box-bgc);
  color: var(--fontNormal);
  border: 1px solid var(--hover-color);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more button:hover:not(:disabled) {
  background-color: var(--hover-color);
}

.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Categories Section */
.categories-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.category-card {
  background-color: var(--box-bgc);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  box-shadow: var(--boxHoverShadow);
  transform: translateY(-5px);
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--fontNormal);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 40px 16px;
  }
  
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-search input {
    padding: 12px 16px;
  }
  
  .hero-search button {
    padding: 0 16px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
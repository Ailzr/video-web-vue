<script setup lang="ts">
import { useRoute } from "vue-router";
import { global } from "../api/global.ts";
import { myVideoManager } from "../api/myVideo.ts";
import Comment from "../components/Comment.vue";
import { ref, onMounted } from "vue";

const path = global.path;
const route = useRoute();
const video_id = route.params.video_id as string; 
const video_url = path + "/video/get-video?video_id=" + video_id;

const my_video_manager = new myVideoManager();

// For demonstration purposes - you would fetch this data from your API
const videoTitle = ref("视频标题");
const videoDescription = ref("视频描述内容会显示在这里。这是一段示例文字，实际使用时请替换为真实的视频描述。");
const videoUpdateTime = ref("2024-01-01 12:00:00");
const videoViews = ref(1024);
const videoLikes = ref(42);
const isLiked = ref(false);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    videoLikes.value++;
  } else {
    videoLikes.value--;
  }
  // TODO 调用API更新点赞状态
};

// Format view count
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
};

onMounted(async () => {
  const videoDetail = await my_video_manager.getVideoDetail(video_id);
  if (videoDetail) {
    videoTitle.value = videoDetail.title;
    videoViews.value = videoDetail.get_num;
    videoLikes.value = videoDetail.like_num;
    videoDescription.value = videoDetail.description;
    const date = new Date(videoDetail.updated_at);
    videoUpdateTime.value = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
});
</script>

<template>
  <div class="video-page">
    <!-- Video Player Section -->
    <div class="video-player-section">
      <h1 class="video-title">{{ videoTitle }}</h1>
      <!-- TODO 展示更新时间 -->
      <div class="video-update-time">
        <span>发布时间：{{ videoUpdateTime }}</span>
      </div>
      <div class="video-player-container">
        <video 
          controls
          :src="video_url" 
          class="video-player" 
          autoplay
          muted
          @play="my_video_manager.playVideo(video_id)"
        ></video>
      </div>

      
      
      <!-- Video Info Section -->
      <div class="video-info">
        <div class="video-stats">
          <div class="views">
            <span class="views-icon">👁️</span>
            {{ formatCount(videoViews) }} 次观看
          </div>
          
          <div class="actions">
            <button 
              class="action-button like-button" 
              :class="{ 'liked': isLiked }"
              @click="toggleLike"
            >
              <span class="like-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
              {{ formatCount(videoLikes) }}
            </button>
            
            <button class="action-button share-button">
              <span class="share-icon">🔗</span>
              分享
            </button>
            
            <button class="action-button save-button">
              <span class="save-icon">🔖</span>
              收藏
            </button>
          </div>
        </div>
        
        <div class="video-description">
          <p>{{ videoDescription }}</p>
        </div>
      </div>
    </div>
    
    <!-- Divider -->
    <div class="section-divider"></div>
    
    <!-- Comments Section -->
    <div class="comments-section">
      <h2 class="section-title">评论</h2>
      <Comment />
    </div>
  </div>
</template>

<style scoped>
.video-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--fontNormal);
  background-color: var(--content-bgc);
}

/* Video Player Section */
.video-player-section {
  margin-bottom: 24px;
}

.video-player-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  background-color: #000; /* 保持视频容器为黑色背景 */
  aspect-ratio: 16 / 9;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000; /* 保持视频播放器为黑色背景 */
}

/* Video Info Section */
.video-info {
  margin-top: 20px;
}

.video-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--fontNormal);
}

.video-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--fontNormal);
  opacity: 0.7;
  font-size: 0.9rem;
}

.views-icon {
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: var(--box-bgc);
  color: var(--fontNormal);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--box-shadow);
}

.action-button:hover {
  background-color: var(--hover-color);
  box-shadow: var(--boxHoverShadow);
}

.like-button.liked {
  background-color: rgba(229, 57, 53, 0.1);
  color: #e53935;
}

.video-description {
  background-color: var(--box-bgc);
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  line-height: 1.6;
  box-shadow: var(--box-shadow);
  color: var(--fontNormal);
}

/* Divider */
.section-divider {
  height: 1px;
  background-color: var(--hover-color);
  margin: 32px 0;
}

/* Comments Section */
.comments-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--fontNormal);
}

/* Responsive Design */
@media (max-width: 768px) {
  .video-page {
    padding: 12px;
  }
  
  .video-title {
    font-size: 1.3rem;
  }
  
  .video-stats {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  .action-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (min-width: 1024px) {
  .video-player-container {
    border-radius: 16px;
  }
  
  .video-title {
    font-size: 1.8rem;
  }
}
</style>
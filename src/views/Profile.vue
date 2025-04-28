<template>
  <div class="personal-space">
    <div class="header-section">
      <div class="header-content">
        <h1 class="title">我的视频空间</h1>
        <p class="subtitle">管理和浏览您上传的视频</p>
      </div>
      <div class="header-actions">
        <button class="upload-button" @click="navigateToUpload">
          <span class="button-icon">📤</span>
          上传新视频
        </button>
      </div>
    </div>

    <div class="content-section">
      <div v-if="loading && page === 1" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <template v-else>
        <VideoGrid 
          :videos="video_list" 
          :editable="true" 
          @edit="handleEdit"
          @delete="handleDelete"
          v-if="video_list.length" 
        />
        
        <div v-else class="empty-state">
          <div class="empty-icon">🎬</div>
          <h3 class="empty-title">暂无视频</h3>
          <p class="empty-description">您还没有上传任何视频，点击上方的"上传新视频"按钮开始创建。</p>
          <button class="empty-action" @click="navigateToUpload">
            立即上传
          </button>
        </div>
      </template>
    </div>

    <div class="pagination-section" v-if="video_list.length > 0">
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import VideoGrid from "../components/VideoGrid.vue";
import { UserManager } from "../api/user";
import { myVideoManager, type myVideo } from "../api/myVideo";
import { useMessage, useDialog } from "naive-ui";

const router = useRouter();
const user_manager = new UserManager();
const my_video_manager = new myVideoManager();
const message = useMessage();
const dialog = useDialog();

const page = ref(1);
const video_list = ref<myVideo[]>([]);
const loading = ref(true);
const hasMore = ref(true);

const loadVideos = async () => {
  loading.value = true;
  try {
    const user_video_list = await user_manager.getUserVideo(page.value);
    if (user_video_list.length === 0) {
      hasMore.value = false;
      return;
    }
    const new_videos = await my_video_manager.getVideoListByIds(user_video_list);

    const existingIds = new Set(video_list.value.map(video => video.uuid));
    const filteredVideos = new_videos.filter((video: myVideo) => !existingIds.has(video.uuid));

    video_list.value.push(...filteredVideos);
    page.value++;
  } catch (error) {
    message.error("加载视频失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (video: myVideo) => {
  router.push({
    path: '/upload',
    query: { video_id: video.uuid }
  });
};

const handleDelete = async (video: myVideo) => {
  dialog.warning({
    title: '确认删除',
    content: `确定删除视频 "${video.title}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const resp = await my_video_manager.deleteVideo(video.uuid);
        if (resp !== "") {
          message.error(resp);
          return;
        }
        video_list.value = video_list.value.filter(v => v.uuid !== video.uuid);
        message.success("删除成功");
      } catch (error) {
        message.error("删除失败：" + (error instanceof Error ? error.message : "未知错误"));
      }
    }
  });
};

const navigateToUpload = () => {
  router.push('/upload');
};

onMounted(loadVideos);
</script>

<style scoped>
.personal-space {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  text-align: left;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--fontNormal);
}

.subtitle {
  font-size: 16px;
  color: var(--fontNormal);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upload-button:hover {
  background-color: #4f46e5;
}

.button-icon {
  font-size: 18px;
}

/* Content Section */
.content-section {
  min-height: 300px;
}

/* Empty State */
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
  margin: 0 0 24px 0;
}

.empty-action {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.empty-action:hover {
  background-color: #4f46e5;
}

/* Loading States */
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

/* Pagination Section */
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-content {
    text-align: center;
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .upload-button {
    width: 100%;
    justify-content: center;
  }
  
  .title {
    font-size: 24px;
  }
}
</style>
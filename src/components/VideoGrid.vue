<template>
  <div class="video-grid">
    <div 
      v-for="video in processedVideos" 
      :key="video.uuid"
      class="video-card-wrapper"
    >
      <NCard 
        class="video-card"
        :class="{ 'editable': editable }"
        :hoverable="true"
        @click="router.push({name: 'Video', params: { video_id: video.uuid }})"
      >
        <div class="thumbnail-container">
          <img :src="video.face" class="video-thumbnail" alt="Video Thumbnail"/>
          <div class="play-overlay">
            <div class="play-icon">▶</div>
          </div>
        </div>
        
        <div class="video-details">
          <h3 class="video-title">{{ video.title }}</h3>
          
          <div class="video-stats">
            <div class="stat-item">
              <span class="stat-icon">👁️</span>
              <span class="stat-value">{{ formatNumber(video.get_num) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">{{ formatNumber(video.like_num) }}</span>
            </div>
          </div>
          
          <div v-if="editable" class="video-actions">
            <button class="action-button edit-button" @click.stop="editVideo(video)">
              <span class="button-icon">✏️</span>
              编辑
            </button>
            <button class="action-button delete-button" @click.stop="deleteVideo(video)">
              <span class="button-icon">🗑️</span>
              删除
            </button>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { global } from "../api/global.ts";
import { myVideo } from "../api/myVideo.ts";
import { NCard } from "naive-ui";

const router = useRouter();
const path = global.path;
const emit = defineEmits(["edit", "delete"]);

const props = defineProps<{
  videos: myVideo[];
  editable?: boolean;
}>();

const processedVideos = computed(() => {
  return props.videos.map(video => ({
    ...video,
    face: `${path}/video/get-video-face?video_id=${video.uuid}`
  }));
});

const editVideo = (video: myVideo) => {
  emit("edit", video);
};

const deleteVideo = (video: myVideo) => {
  emit("delete", video);
};

// Format numbers to K, M format
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  padding: 0;
}

.video-card-wrapper {
  transition: transform 0.2s ease;
}

.video-card-wrapper:hover {
  transform: translateY(-4px);
}

.video-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--video-card-bgc, #ffffff);
  color: var(--fontNormal, #333333);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.video-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.thumbnail-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.video-card:hover .video-thumbnail {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6366f1;
}

.video-details {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;  /* 添加这行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--fontNormal, #333333);
}

.video-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--fontNormal, #666666);
}

.stat-icon {
  font-size: 14px;
}

.video-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-icon {
  font-size: 14px;
}

.edit-button {
  background-color: #f0ad4e;
  color: white;
}

.edit-button:hover {
  background-color: #ec971f;
}

.delete-button {
  background-color: #d9534f;
  color: white;
}

.delete-button:hover {
  background-color: #c9302c;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .video-title {
    font-size: 14px;
  }
  
  .stat-item, .action-button {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
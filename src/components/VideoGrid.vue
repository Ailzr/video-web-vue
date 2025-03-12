<template>
  <div class="video-grid">
    <NCard 
      v-for="video in processedVideos" 
      :key="video.uuid"
      class="video-card"
      :hoverable="true"
      @click="router.push({name: 'Video', params: { video_id: video.uuid }})"
    >
      <img :src="video.face" class="video-face" alt="Video Thumbnail"/>
      
      <div class="video-details">
        <h3 class="video-title">{{ video.title }}</h3>
        <p class="video-description">播放数: {{ video.get_num }} 点赞数: {{ video.like_num }}</p>
        
        <!-- 仅在 Profile 页面显示编辑和删除按钮 -->
        <div v-if="editable" class="actions">
          <button class="edit-btn" @click.stop="editVideo(video)">编辑</button>
          <button class="delete-btn" @click.stop="deleteVideo(video)">删除</button>
        </div>
      </div>
    </NCard>
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
  //console.log("click delete button");
  emit("delete", video);
};
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 580px));
  gap: 20px; /* 控制 grid 之间的间距 */
  padding: 20px 30px; /* 左右各留 30px，避免 grid 贴边 */
  width: calc(100% - 60px); /* 避免 grid 过宽，60px 来自 30px * 2 padding */
  margin: 0 auto; /* 居中 */
}

.video-card {
  /* background-color: #2c2c2c; */
  background-color: var(--video-card-bgc);
  color: var(--fontNormal);
  border: 0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px; /* Add some margin between each card */
}

.video-face {
  width: 100%;  /* Make the width of the image 100% of the container */
  height: 200px; /* Fixed height for consistent size */
  object-fit: cover; /* Ensure the image covers the area and maintains aspect ratio */
  border-radius: 10px;
}

.video-details {
  padding: 15px;
  /* color: #fff; */
}

.video-title {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.video-description {
  font-size: 0.9em;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px; /* 按钮之间的间距 */
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.edit-btn {
  background-color: #f0ad4e;
  color: white;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
}

</style>

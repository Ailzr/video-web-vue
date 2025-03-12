<template>
    <div class="personal-space">
      <h1 class="title">我的视频空间</h1>
      <p class="subtitle">管理和浏览您上传的视频</p>
  
      <VideoGrid 
        :videos="video_list" 
        :editable="true" 
        @edit="handleEdit"
        @delete="handleDelete"
        v-if="video_list.length" 
      />
      
      <p v-else class="empty-text">暂无视频，快去上传吧！</p>
  
      <div class="controls">
        <button @click="loadVideos" v-if="hasMore" :disabled="loading" class="load-more">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import VideoGrid from "../components/VideoGrid.vue";
  import { UserManager } from "../api/user";
  import { myVideoManager, type myVideo } from "../api/myVideo";
  import { useMessage } from "naive-ui";
  
  const user_manager = new UserManager();
  const my_video_manager = new myVideoManager();
  const message = useMessage();
  
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
    console.log("编辑视频", video);
    // TODO: 跳转到编辑页面
  };
  
  const handleDelete = async (video: myVideo) => {
    if (confirm(`确定删除视频 "${video.title}" 吗？`)) {
        let resp = await my_video_manager.deleteVideo(video.uuid);
        if (resp != ""){
            message.error(resp);
            return;
        }
        message.success("删除成功");
    }
  };
  
  onMounted(loadVideos);
  </script>
  
  <style scoped>
.personal-space {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: gray;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 14px;
  color: gray;
  margin: 20px 0;
}

.controls {
  margin-top: 20px;
}

.load-more {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.load-more:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

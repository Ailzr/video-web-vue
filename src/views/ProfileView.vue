<template>
  <div class="personal-space">
    <!-- 用户信息展示区域 -->
    <div class="user-profile-section" v-if="user_info">
      <div class="user-profile-header">
        <div class="user-avatar">
          <img :src="getAvatarPath(user_info.avatar || '')" alt="用户头像">
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user_info.nickname }}</h2>
          <p class="user-bio">{{ user_info.description || '这个人很懒，什么都没留下~' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ user_info.fan_num || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
        </div>
        <div class="user-actions" v-if="!is_self">
          <button 
            class="follow-button" 
            :class="{ 'following': isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
    </div>

    <div class="header-section">
      <div class="header-content">
        <h1 class="title">{{ is_self ? '我的视频空间' : `${user_info?.nickname || '用户'}的视频` }}</h1>
        <p class="subtitle">{{ is_self ? '管理和浏览您上传的视频' : '浏览该用户上传的视频' }}</p>
      </div>
      <div class="header-actions" v-if="is_self">
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
          :editable="is_self" 
          @edit="handleEdit"
          @delete="handleDelete"
          v-if="video_list.length" 
        />
        
        <div v-else class="empty-state">
          <div class="empty-icon">🎬</div>
          <h3 class="empty-title">暂无视频</h3>
          <p class="empty-description">
            {{ is_self 
              ? '您还没有上传任何视频，点击上方的"上传新视频"按钮开始创建。' 
              : '该用户还没有上传任何视频。' 
            }}
          </p>
          <button class="empty-action" @click="navigateToUpload" v-if="is_self">
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
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import VideoGrid from "../components/VideoGrid.vue";
import { UserManager, User, getAvatarPath } from "../api/user";
import my_video_manager, { myVideo } from "../api/myVideo";
import follow_manager from "../api/follow";
import { useMessage, useDialog } from "naive-ui";

const router = useRouter();
const route = useRoute();
const message = useMessage();
const dialog = useDialog();

const user_manager = new UserManager();
const user_id = computed(() => route.params.user_id as string || UserManager.getUserId);
const is_self = computed(() => user_id.value === UserManager.getUserId);
const user_info = ref<User | null>(null);
const isFollowing = ref(false);

const page = ref(1);
const video_list = ref<myVideo[]>([]);
const loading = ref(true);
const hasMore = ref(true);

const getUserInfo = ref<any>(null);
const checkFollowStatus = ref<any>(null);
const loadVideos = ref<any>(null);

// 重置页面状态并重新加载数据
const resetAndReload = async () => {
  // 重置状态
  page.value = 1;
  video_list.value = [];
  loading.value = true;
  hasMore.value = true;
  user_info.value = null;
  isFollowing.value = false;
  
  // 重新加载数据
  await getUserInfo.value();
  await checkFollowStatus.value();
  await loadVideos.value();
};

// 检查是否已关注该用户
checkFollowStatus.value = async () => {
  if (is_self.value) return;
  
  try {
    const followList = await follow_manager.getFollowList(1);
    isFollowing.value = followList.some((user: any) => user.uuid === user_id.value);
  } catch (error) {
    console.error("获取关注状态失败", error);
  }
};

// 切换关注状态
const toggleFollow = async () => {
  if (!UserManager.isLogin()) {
    message.warning("请先登录");
    router.push("/login");
    return;
  }
  
  try {
    const result = await follow_manager.updateFollow(user_id.value);
    if (result) {
      if (isFollowing.value) {
        message.success("已取消关注");
      } else {
        message.success("关注成功");
      }
    } else {
      message.error("操作失败，请稍后重试");
    }
    isFollowing.value = !isFollowing.value;
    
    // 更新用户信息中的粉丝数
    if (user_info.value) {
      user_info.value.fan_num = (user_info.value.fan_num || 0) + (isFollowing.value ? 1 : -1);
    }
  } catch (error) {
    message.error("操作失败，请稍后重试");
  }
};

loadVideos.value = async () => {
  loading.value = true;
  try {
    const user_video_list = await user_manager.getUserVideo(user_id.value, page.value);
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

getUserInfo.value = async () => {
  try {
    user_info.value = await user_manager.getUserInfoByUuid(user_id.value);
  } catch (error) {
    message.error("获取用户信息失败");
  }
};

const navigateToUpload = () => {
  router.push('/upload');
};

// 监听路由参数变化
watch(
  () => route.params.user_id,
  (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      resetAndReload();
    }
  }
);

onMounted(async () => {
  await getUserInfo.value();
  await checkFollowStatus.value();
  loadVideos.value();
});
</script>

<style scoped>
.personal-space {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 用户资料部分 */
.user-profile-section {
  margin-bottom: 32px;
  background-color: var(--background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #f3f4f6;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--fontNormal);
}

.user-bio {
  font-size: 16px;
  color: var(--fontNormal);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.user-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--fontNormal);
}

.stat-label {
  font-size: 14px;
  color: var(--fontLight);
}

.user-actions {
  margin-left: auto;
}

.follow-button {
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-button.following {
  background-color: #e5e7eb;
  color: #4b5563;
}

.follow-button:hover {
  opacity: 0.9;
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
  .user-profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .user-actions {
    margin-left: 0;
    margin-top: 16px;
  }
  
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
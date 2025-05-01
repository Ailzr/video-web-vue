<script setup lang="ts">
import { useRoute } from "vue-router";
import { global } from "../api/global.ts";
import my_video_manager from "../api/myVideo.ts";
import Comment from "../components/Comment.vue";
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import like_manager from "../api/Like.ts";
import favorite_manager from "../api/favorite";
import { useMessage } from "naive-ui";
import { User, getAvatarPath, UserManager } from "../api/user.ts";
import follow_manager from "../api/follow";
import DPlayer from 'dplayer';

// const router = useRouter();
const route = useRoute();
const video_id = route.params.video_id as string;
// 使用代理URL而不是直接URL
// const video_url = `/apis/video/get-video?video_id=${video_id}`;
const video_url = global.path + "/video/get-video?video_id=" + video_id;

// DPlayer实例和容器引用
const dPlayerContainer = ref<HTMLDivElement | null>(null);
const dPlayer = ref<any>(null);

// 视频信息
const videoTitle = ref("视频标题");
const videoDescription = ref("视频描述内容会显示在这里。这是一段示例文字，实际使用时请替换为真实的视频描述。");
const videoUpdateTime = ref("2024-01-01 12:00:00");
const videoViews = ref(1024);
const videoLikes = ref(42);
const isLiked = ref(false);
const isFavorite = ref(false);
const isFollowed = ref(false);
const author = ref<User | null>(null);

// 音量控制
const volume = ref(0.7); // 默认音量

const message = useMessage();

// 初始化DPlayer
const initDPlayer = () => {
  if (!dPlayerContainer.value) return;

  // 从localStorage获取保存的音量设置
  const savedVolume = localStorage.getItem('video-player-volume');
  const savedMuted = localStorage.getItem('video-player-muted');

  // 设置初始音量
  if (savedVolume !== null) {
    volume.value = parseFloat(savedVolume);
  }

  // 创建DPlayer实例
  dPlayer.value = new DPlayer({
    container: dPlayerContainer.value,
    autoplay: true,
    theme: '#6366f1',
    loop: false,
    lang: 'zh-cn',
    screenshot: false,
    hotkey: true,
    volume: volume.value,
    mutex: true,
    video: {
      url: video_url,
      type: 'auto', // 使用自定义类型
    },
  });

  // 设置静音状态
  if (savedMuted === 'true') {
    dPlayer.value.video.muted = true;
  } else {
    dPlayer.value.video.muted = false;
  }

  // 监听音量变化，保存到localStorage
  dPlayer.value.on('volumechange', () => {
    const currentVolume = dPlayer.value.volume;
    const isMuted = dPlayer.value.video.muted;

    localStorage.setItem('video-player-volume', currentVolume.toString());
    localStorage.setItem('video-player-muted', isMuted.toString());
  });

  // 记录播放进度
  dPlayer.value.on('timeupdate', () => {
    const currentTime = dPlayer.value.video.currentTime;
    localStorage.setItem(`video-progress-${video_id}`, currentTime.toString());
  });

  // 恢复播放进度
  const savedProgress = localStorage.getItem(`video-progress-${video_id}`);
  if (savedProgress) {
    const seekTime = parseFloat(savedProgress);
    // 等待视频元数据加载完成后再设置时间
    dPlayer.value.on('loadedmetadata', () => {
      dPlayer.value.seek(seekTime);
    });
  }
};

// 点赞功能
const toggleLike = async () => {
  if (!UserManager.isLogin()) {
    message.error("请先登录");
    return;
  }
  await like_manager.updateLike(video_id);
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    videoLikes.value++;
  } else {
    videoLikes.value--;
  }
};

// 收藏功能
const toggleFavorite = async () => {
  if (!UserManager.isLogin()) {
    message.error("请先登录");
    return;
  }
  try {
    await favorite_manager.updateFavorite(video_id);
    isFavorite.value = !isFavorite.value;
    if (isFavorite.value) {
      message.success("收藏成功");
    } else {
      message.success("取消收藏成功");
    }
  } catch (error) {
    message.error("发生错误");
  }
};

// 关注功能
const toggleFollow = async () => {
  if (!UserManager.isLogin()) {
    message.error("请先登录");
    return;
  }
  if (!author.value?.uuid) {
    message.error("无法获取作者信息");
    return;
  }
  if (UserManager.getUserId === author.value?.uuid) {
    message.error("无法关注自己");
    return;
  }
  try {
    const result = await follow_manager.updateFollow(author.value.uuid);
    if (result) {
      isFollowed.value = !isFollowed.value;
      if (isFollowed.value) {
        message.success("关注成功");
      } else {
        message.success("取消关注成功");
      }
    } else {
      message.error("操作失败");
    }
  } catch (error) {
    message.error("操作失败");
  }
};

// 跳转到作者主页
const goToAuthorProfile = () => {
  message.error("敬请期待");
  return;
  // if (author.value?.nickname) {
  //   router.push({ name: 'Profile', params: { username: author.value.nickname } });
  // }
};

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
};

// 格式化相对时间
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)}个月前`;
  } else {
    return `${Math.floor(diffInSeconds / 31536000)}年前`;
  }
};

const videoDetail = ref<any>(null);

onMounted(async () => {
  try {
    const videoData = await my_video_manager.getVideoDetail(video_id);
    if (videoData) {
      videoDetail.value = videoData;
      videoTitle.value = videoDetail.value.title;
      videoViews.value = videoDetail.value.get_num;
      videoLikes.value = videoDetail.value.like_num;
      videoDescription.value = videoDetail.value.description;
      const date = new Date(videoDetail.value.updated_at);
      videoUpdateTime.value = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      isLiked.value = videoDetail.value.is_like;
      isFavorite.value = videoDetail.value.is_favorite;
      author.value = videoDetail.value.author;
      isFollowed.value = videoDetail.value.author?.is_followed || false;
    }
  } catch (error) {
    message.error("获取视频信息失败");
  }

  // 初始化DPlayer
  await nextTick();
  initDPlayer();

  if (UserManager.isLogin()) {
    my_video_manager.playVideo(video_id);
  }
});

onUnmounted(() => {
  // 销毁DPlayer实例，避免内存泄漏
  if (dPlayer.value) {
    dPlayer.value.destroy();
  }
});
</script>

<template>
  <div class="video-page">
    <!-- 视频播放器部分 -->
    <div class="video-player-section">
      <h1 class="video-title">{{ videoTitle }}</h1>

      <div class="video-update-time">
        <span>{{ formatRelativeTime(videoUpdateTime) }}</span>
      </div>

      <!-- DPlayer容器 -->
      <div class="video-player-container">
        <div ref="dPlayerContainer" class="dplayer-container"></div>
      </div>

      <!-- 视频信息部分 -->
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

            <button
              class="action-button favorite-button"
              :class="{ 'favorite': isFavorite }"
              @click="toggleFavorite"
            >
              <span class="favorite-icon">{{ isFavorite ? '🔖' : '🔖' }}</span>
              {{ isFavorite ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>

        <!-- 作者卡片 -->
        <div class="author-card">
          <div class="author-info" @click="goToAuthorProfile">
            <div class="author-avatar">
              <img :src="getAvatarPath(author?.avatar || '')" alt="作者头像">
            </div>

            <div class="author-details">
              <h3 class="author-name">{{ author?.nickname }}</h3>
              <p class="author-stats">{{ formatCount(author?.fans_num || 0) }} 粉丝</p>
            </div>
          </div>

          <button
            class="follow-button"
            :class="{ 'following': isFollowed }"
            @click="toggleFollow"
          >
            <span class="follow-icon">{{ isFollowed ? '✓' : '+' }}</span>
            {{ isFollowed ? "已关注" : "关注" }}
          </button>
        </div>

        <div class="video-description">
          <p>{{ videoDescription }}</p>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="section-divider"></div>

    <!-- 评论部分 -->
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

/* 视频播放器部分 */
.video-player-section {
  margin-bottom: 24px;
}

.video-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--fontNormal);
}

.video-update-time {
  font-size: 0.9rem;
  color: var(--fontNormal);
  opacity: 0.7;
  margin-bottom: 16px;
}

.video-player-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  background-color: #000;
  aspect-ratio: 16 / 9;
}

.dplayer-container {
  width: 100%;
  height: 100%;
}

/* 视频信息部分 */
.video-info {
  margin-top: 20px;
}

.video-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.favorite-button.favorite {
  background-color: rgba(229, 57, 53, 0.1);
  color: #e53935;
}

/* 作者卡片 */
.author-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--box-bgc);
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  box-shadow: var(--box-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.author-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--boxHoverShadow);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  flex: 1;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--fontNormal);
}

.author-stats {
  font-size: 0.9rem;
  color: var(--fontNormal);
  opacity: 0.7;
  margin: 0;
}

.follow-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: #6366f1;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-button:hover {
  background-color: #4f46e5;
}

.follow-button.following {
  background-color: var(--hover-color);
  color: var(--fontNormal);
}

.follow-icon {
  font-size: 1rem;
  font-weight: bold;
}

.video-description {
  background-color: var(--box-bgc);
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  box-shadow: var(--box-shadow);
  color: var(--fontNormal);
}

/* 分隔线 */
.section-divider {
  height: 1px;
  background-color: var(--hover-color);
  margin: 32px 0;
}

/* 评论部分 */
.comments-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--fontNormal);
}

/* 响应式设计 */
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

  .author-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .follow-button {
    align-self: stretch;
  }
}

@media (min-width: 1024px) {
  .video-player-container {
    border-radius: 16px;
  }

  .video-title {
    font-size: 1.8rem;
  }

  .author-avatar {
    width: 70px;
    height: 70px;
  }
}
</style>
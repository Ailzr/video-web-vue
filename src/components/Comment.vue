<template>
    <div class="comment-container">
      <h2 class="comment-title">评论区</h2>
      
      <!-- Comment List -->
      <div class="comment-list" v-if="commentList.length > 0">
        <div class="comment-item" v-for="comment in commentList" :key="comment.uuid">
          <div class="comment-avatar">
            <div class="avatar-circle"><img :src="`${global.path}/user/get-avatar?user_id=${comment.user?.uuid}`" alt="" style="width: 100%; height: 100%; border-radius: 50%;"></div>
          </div>
          <div class="comment-body">
            <div class="comment-user">{{ comment.user?.nickname }}</div>
            <div class="comment-time">评论时间：
              {{ formatCommentTime(comment.updated_at || '') }}
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <button class="action-button" @click="deleteComment(comment.uuid)">删除</button>
              <button class="action-button">回复</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-comments" v-else>
        <div class="empty-icon">💬</div>
        <div class="empty-text">暂无评论，快来发表第一条评论吧！</div>
      </div>
  
      <!-- Comment Input -->
      <div class="comment-input-container">
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="commentContent" 
            placeholder="请输入评论内容" 
            class="comment-input"
            @keyup.enter="addComment"
          >
          <button @click="addComment" class="comment-button">
            发表评论
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import commentManager, { Comment } from '../api/comment';
  import { ref, onMounted } from 'vue';
  import { useMessage } from 'naive-ui';
  import { global } from '../api/global';

  const message = useMessage();
  const commentList = ref<Comment[]>([]);
  const commentContent = ref<string>('');
  const videoId = ref<string>('');

  // 时间格式化函数
  const formatCommentTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid time value:', timeStr);
      return '无效时间';
    }
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('zh-CN', options).format(date);
  };
  
  // 获取视频id
  const getVideoId = () => {
      videoId.value = window.location.pathname.split('/')[2];
  }
  
  // 获取评论列表
  onMounted(async () => {
      getVideoId();
      commentList.value = await commentManager.getCommentList(videoId.value);
  });
  
  const addComment = async () => {
      console.log(commentContent.value);
      if (commentContent.value === '') {
          return;
      }
      let comment: Comment = {
          uuid: '',
          content: commentContent.value,
          video_id: videoId.value,
      }
      let result = await commentManager.addComment(comment);
      if (result) {
        message.success('评论成功');
        // 清空评论内容
        commentContent.value = '';
        // 刷新评论列表
        commentList.value = await commentManager.getCommentList(videoId.value);
      } else {
        message.error('评论失败');
      }
  };
  
  const deleteComment = async (commentId: string) => {
      await commentManager.deleteComment(commentId);
      commentList.value = await commentManager.getCommentList(videoId.value);
  };
  </script>
  
<style scoped>
  .comment-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--content-bgc);
    color: var(--fontNormal);
  }
  
  .comment-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--fontNormal);
  }
  
  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .comment-item {
    display: flex;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--box-bgc);
    box-shadow: var(--box-shadow);
    transition: all 0.2s ease;
  }
  
  .comment-item:hover {
    background-color: var(--hover-color);
    transform: translateY(-2px);
    box-shadow: var(--boxHoverShadow);
  }
  
  .comment-avatar {
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }
  
  .comment-body {
    flex: 1;
  }
  
  .comment-user {
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--fontNormal);
  }
  
  .comment-content {
    line-height: 1.5;
    margin-bottom: 8px;
    word-break: break-word;
    color: var(--fontNormal);
  }
  
  .comment-actions {
    display: flex;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .comment-item:hover .comment-actions {
    opacity: 1;
  }
  
  .action-button {
    background: none;
    border: none;
    color: #6366f1;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
  }
  
  .action-button:hover {
    text-decoration: underline;
  }
  
  .empty-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: var(--fontNormal);
    opacity: 0.6;
  }
  
  .empty-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  .empty-text {
    font-size: 0.95rem;
  }
  
  .comment-input-container {
    margin-top: 20px;
    border-top: 1px solid var(--hover-color);
    padding-top: 20px;
  }
  
  .input-wrapper {
    display: flex;
    gap: 8px;
  }
  
  .comment-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--hover-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: var(--box-bgc);
    color: var(--fontNormal);
  }
  
  .comment-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  .comment-button {
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .comment-button:hover {
    background-color: #4f46e5;
  }
  
  .comment-button:disabled {
    background-color: #c7d2fe;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  @media (max-width: 640px) {
    .comment-container {
      padding: 16px;
    }
    
    .input-wrapper {
      flex-direction: column;
    }
    
    .comment-button {
      width: 100%;
      padding: 12px;
    }
  }
</style>
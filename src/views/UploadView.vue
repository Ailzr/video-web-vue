<template>
  <div class="upload-page">
    <div class="upload-container">
      <h1 class="page-title">{{ editMode ? '编辑视频' : '上传视频' }}</h1>
      
      <!-- Upload Section -->
      <div class="upload-section" v-if="!editMode">
        <!-- Cover Upload -->
        <div 
          class="upload-area" 
          :class="{ 'has-file': faceFile, 'is-dragging': isDraggingCover }"
          @dragover.prevent="isDraggingCover = true"
          @dragleave.prevent="isDraggingCover = false"
          @drop.prevent="handleCoverDrop($event)"
        >
          <div class="upload-content" v-if="!faceFile">
            <div class="upload-icon">🖼️</div>
            <h3>上传封面图片</h3>
            <p>拖拽文件到此处或点击上传</p>
            <input 
              type="file" 
              id="cover-upload" 
              accept="image/*" 
              @change="handleCoverChange" 
              class="file-input"
            />
            <label for="cover-upload" class="upload-button">选择文件</label>
          </div>
          <div class="preview-container" v-else>
            <img :src="coverPreview" alt="Cover Preview" class="cover-preview" />
            <div class="preview-overlay">
              <button class="remove-button" @click="removeCover">移除</button>
            </div>
          </div>
        </div>
        
        <!-- Video Upload -->
        <div 
          class="upload-area" 
          :class="{ 'has-file': videoFile, 'is-dragging': isDraggingVideo }"
          @dragover.prevent="isDraggingVideo = true"
          @dragleave.prevent="isDraggingVideo = false"
          @drop.prevent="handleVideoDrop($event)"
        >
          <div class="upload-content" v-if="!videoFile">
            <div class="upload-icon">🎬</div>
            <h3>上传视频文件</h3>
            <p>拖拽文件到此处或点击上传</p>
            <input 
              type="file" 
              id="video-upload" 
              accept="video/*" 
              @change="handleVideoChange" 
              class="file-input"
            />
            <label for="video-upload" class="upload-button">选择文件</label>
          </div>
          <div class="preview-container" v-else>
            <div class="video-info-preview">
              <div class="video-file-icon">🎞️</div>
              <div class="video-file-details">
                <p class="video-filename">{{ videoFile.name }}</p>
                <p class="video-filesize">{{ formatFileSize(videoFile.size) }}</p>
              </div>
            </div>
            <div class="preview-overlay">
              <button class="remove-button" @click="removeVideo">移除</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Video Information Form -->
      <div class="video-info-form">
        <h2 class="section-title">视频信息</h2>
        
        <div class="form-group">
          <label for="video-title">视频标题</label>
          <input 
            type="text" 
            id="video-title" 
            v-model="videoTitle" 
            placeholder="请输入视频标题"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="video-type">视频类型</label>
          <select id="video-type" v-model="videoType" class="form-input">
            <option value="">请选择视频类型</option>
            <option value="entertainment">娱乐</option>
            <option value="education">教育</option>
            <option value="gaming">游戏</option>
            <option value="music">音乐</option>
            <option value="sports">体育</option>
            <option value="technology">科技</option>
            <option value="cooking">美食</option>
            <option value="travel">旅游</option>
            <option value="fashion">时尚</option>
            <option value="animation">动画</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="video-description">视频描述</label>
          <textarea 
            id="video-description" 
            v-model="videoDescription" 
            placeholder="请输入视频描述"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="uploading" class="progress-section">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-details">
          <p class="progress-percentage">{{ uploadProgress }}%</p>
          <p class="progress-speed">{{ uploadSpeed }} KB/s</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          v-if="editMode" 
          @click="handleEdit" 
          class="primary-button"
          :disabled="!videoTitle || !videoType"
        >
          保存修改
        </button>
        <button 
          v-else 
          @click="handleUpload" 
          class="primary-button"
          :disabled="!faceFile || !videoFile || !videoTitle || !videoType"
        >
          上传视频
        </button>
        <button @click="router.push({name:'Profile'})" class="secondary-button">
          取消
        </button>
      </div>
      
      <!-- Status Message -->
      <div v-if="uploadSuccess !== null" class="status-message" :class="{'success': uploadSuccess, 'error': !uploadSuccess}">
        <div class="status-icon">{{ uploadSuccess ? '✅' : '❌' }}</div>
        <p>{{ uploadSuccess ? '上传成功！' : '上传失败，请重试。' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from "vue-router";
import my_video_manager from '../api/myVideo';
import { useMessage } from "naive-ui";
import { UserManager } from '../api/user';

const router = useRouter();
const route = useRoute();
const message = useMessage();

// Check if user is logged in
if (!UserManager.isLogin()){
    router.push({name:"RegisterAndLogin"});
}

// Form data
const videoTitle = ref('');
const videoType = ref('');
const videoDescription = ref('');
const editMode = ref(false);
const currentVideo = ref<any>(null);

// File upload
const faceFile = ref<File | null>(null);
const videoFile = ref<File | null>(null);
const coverPreview = ref('');
const isDraggingCover = ref(false);
const isDraggingVideo = ref(false);

// Upload progress
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadSpeed = ref(0);
const uploadSuccess = ref<boolean | null>(null);

const videoId = ref<string | "">("");

// Initialize data if in edit mode
onMounted(async () => {
  videoId.value = route.query.video_id as string;
  if (videoId.value) {
    editMode.value = true;
    currentVideo.value = await my_video_manager.getVideoDetail(videoId.value);
    if (currentVideo.value) {
      videoTitle.value = currentVideo.value.title || '';
      videoType.value = currentVideo.value.type || '';
      videoDescription.value = currentVideo.value.description || '';
      
      // If there's a face/cover image, set the preview
      if (currentVideo.value.face) {
        coverPreview.value = currentVideo.value.face;
      }
    }
  }
});

// Handle edit submission
const handleEdit = async () => {
  const updatedVideo = {
    uuid: videoId.value,
    title: videoTitle.value,
    type: videoType.value,
    description: videoDescription.value,
    updated_at: new Date(),
    get_num: 0,
    like_num: 0
  };

  const result = await my_video_manager.editVideo(updatedVideo);
  if (result === '') {
    message.success('视频信息更新成功');
    router.push({name:"Profile", params: { user_id: UserManager.getUserId }});
  } else {
    message.error(`更新失败: ${result}`);
  }
};

// Handle cover file selection
const handleCoverChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    faceFile.value = input.files[0];
    createCoverPreview();
  }
};

// Handle cover file drop
const handleCoverDrop = (event: DragEvent) => {
  isDraggingCover.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('image/')) {
      faceFile.value = file;
      createCoverPreview();
    } else {
      message.error('请上传图片文件');
    }
  }
};

// Create cover preview URL
const createCoverPreview = () => {
  if (faceFile.value) {
    coverPreview.value = URL.createObjectURL(faceFile.value);
  }
};

// Remove cover file
const removeCover = () => {
  faceFile.value = null;
  coverPreview.value = '';
};

// Handle video file selection
const handleVideoChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    videoFile.value = input.files[0];
    extractFilenameAsTitle();
  }
};

// Handle video file drop
const handleVideoDrop = (event: DragEvent) => {
  isDraggingVideo.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('video/')) {
      videoFile.value = file;
      extractFilenameAsTitle();
    } else {
      message.error('请上传视频文件');
    }
  }
};

// Extract filename as title
const extractFilenameAsTitle = () => {
  if (videoFile.value && !videoTitle.value) {
    // Get filename without extension
    const filename = videoFile.value.name.replace(/\.[^/.]+$/, "");
    videoTitle.value = filename;
  }
};

// Remove video file
const removeVideo = () => {
  videoFile.value = null;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle upload
const handleUpload = async () => {
  if (faceFile.value && videoFile.value) {
    uploading.value = true;
    uploadProgress.value = 0;
    uploadSpeed.value = 0;
    const startTime = Date.now();

    const result = await my_video_manager.uploadVideo(faceFile.value, videoFile.value, (progressEvent: any) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? progressEvent.loaded));
      const elapsedTime = (Date.now() - startTime) / 1000;
      const speed = Math.round(progressEvent.loaded / Math.max(elapsedTime, 1) / 1024);
      uploadProgress.value = percentCompleted;
      uploadSpeed.value = speed;
    });
    let success = false;
    if (result != ""){
      success = true;
      videoId.value = result;
      editMode.value = true;
    }

    uploading.value = false;
    uploadSuccess.value = success;
    
    if (success) {
      message.success("上传成功");
    } else {
      message.error("上传失败");
    }
  }
};
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  padding: 40px 20px;
  background-color: var(--video-card-bgc);
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--video-card-bgc);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 32px;
  color: var(--text-color);
  text-align: center;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-color);
}

/* Upload Section */
.upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.upload-area.is-dragging {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}

.upload-area.has-file {
  border-style: solid;
  border-color: #6366f1;
}

.upload-content {
  width: 100%;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  color: #6366f1;
}

.upload-area h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.upload-area p {
  color: var(--text-color-secondary);
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.upload-button {
  display: inline-block;
  background-color: #6366f1;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.upload-button:hover {
  background-color: #4f46e5;
}

/* Preview */
.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.video-info-preview {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--video-card-bgc);
  border-radius: 8px;
  width: 100%;
}

.video-file-icon {
  font-size: 2rem;
  margin-right: 16px;
  color: #6366f1;
}

.video-file-details {
  text-align: left;
}

.video-filename {
  font-weight: 600;
  margin-bottom: 4px;
  word-break: break-all;
  color: var(--text-color);
}

.video-filesize {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.remove-button {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

/* Form */
.video-info-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background-color: var(--input-bgc);
  color: var(--text-color);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Progress */
.progress-section {
  margin-bottom: 24px;
}

.progress-container {
  width: 100%;
  height: 8px;
  background-color: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background-color: #6366f1;
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.primary-button, .secondary-button {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-button {
  background-color: #6366f1;
  color: white;
  flex: 1;
}

.primary-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.primary-button:disabled {
  background-color: #c7d2fe;
  cursor: not-allowed;
}

.secondary-button {
  background-color: var(--button-bgc);
  color: var(--text-color);
}

.secondary-button:hover {
  background-color: var(--button-hover-bgc);
}

/* Status Message */
.status-message {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 6px;
  margin-top: 16px;
}

.status-message.success {
  background-color: #ecfdf5;
  color: #065f46;
}

.status-message.error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.status-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .upload-container {
    padding: 24px;
  }
  
  .upload-section {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
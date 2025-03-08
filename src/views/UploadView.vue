<template>
    <div class="upload-page">
      <h1>视频上传</h1>
      <div class="upload-form">
        <div>
          <label for="cover-upload">封面图片：</label>
          <input type="file" id="cover-upload" accept="image/*" @change="handleCoverChange" />
        </div>
        <div>
          <label for="video-upload">视频文件：</label>
          <input type="file" id="video-upload" accept="video/*" @change="handleVideoChange" />
        </div>
        <button @click="handleUpload" :disabled="!faceFile || !videoFile">上传视频</button>
      </div>
      <div v-if="uploading" class="loading">
        <p>正在上传...</p>
      </div>
      <div v-if="uploadSuccess !== null" :class="{'success': uploadSuccess, 'error': !uploadSuccess}">
        <p>{{ uploadSuccess ? '上传成功！' : '上传失败，请重试。' }}</p>
      </div>
    </div>
  </template>
  
<script lang="ts">
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { myVideoManager } from '../api/myVideo';
import { useMessage } from "naive-ui";
import { UserManager } from '../api/user';
  
  export default {
    setup() {
      const router = useRouter();
      if (!UserManager.isLogin()){
          router.push({name:"RegisterAndLogin"});
      }

      const faceFile = ref<File | null>(null);  // 用于存储封面文件
      const videoFile = ref<File | null>(null);  // 用于存储视频文件
      const uploading = ref(false);  // 是否正在上传
      const uploadSuccess = ref<boolean | null>(null);  // 上传是否成功

      const message = useMessage();

        // 处理封面文件选择
      const handleCoverChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            faceFile.value = input.files[0];
        }
      };

        // 处理视频文件选择
      const handleVideoChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            videoFile.value = input.files[0];
        }
      };

        // 上传视频
      const handleUpload = async () => {
        if (faceFile.value && videoFile.value) {
            uploading.value = true;
            const my_video_manager = new myVideoManager();
            const success = await my_video_manager.uploadVideo(faceFile.value, videoFile.value);
            uploading.value = false;
            uploadSuccess.value = success;
            if(success){
            message.success("上传成功");
            }else{
            message.error("上传失败");
            }
        }
      };

      return {
        faceFile,
        videoFile,
        uploading,
        uploadSuccess,
        handleCoverChange,
        handleVideoChange,
        handleUpload,
      };
    },
  };
</script>
  
<style scoped>
  .upload-page {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    color: white;
  }
  
  .upload-form {
    display: flex;
    flex-direction: column;
    color: white;
  }
  
  .upload-form div {
    margin-bottom: 10px;
  }
  
  button:disabled {
    background-color: #ccc;
  }
  
  .loading {
    text-align: center;
    font-size: 16px;
    color: #666;
  }
  
  .success {
    color: green;
    font-weight: bold;
  }
  
  .error {
    color: red;
    font-weight: bold;
  }
</style>
  
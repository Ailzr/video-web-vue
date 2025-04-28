<template>
    <div class="edit-profile-container">
      <div class="edit-profile-card">
        <div class="card-header">
          <h1 class="page-title">编辑个人资料</h1>
          <p class="page-subtitle">更新您的个人信息和头像</p>
        </div>
        
        <div class="form-container">
          <!-- Avatar Upload Section -->
          <div class="avatar-section">
            <div class="avatar-preview" @click="triggerFileInput">
              <img 
                :src="avatarPreview || defaultAvatarUrl" 
                alt="用户头像" 
                class="avatar-image"
              />
              <div class="avatar-overlay">
                <span class="upload-icon">📷</span>
                <span class="upload-text">更换头像</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              class="file-input" 
              @change="handleAvatarChange"
            />
          </div>
          
          <!-- Profile Form -->
          <form class="profile-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="nickname">昵称</label>
              <input 
                type="text" 
                id="nickname" 
                v-model="nickname" 
                placeholder="请输入昵称"
                :class="{ 'error': errors.nickname }"
              />
              <p class="error-message" v-if="errors.nickname">{{ errors.nickname }}</p>
            </div>
            
            <div class="form-group">
              <label for="description">个人简介</label>
              <textarea 
                id="description" 
                v-model="description" 
                placeholder="请输入个人简介"
                rows="4"
                :class="{ 'error': errors.description }"
              ></textarea>
              <p class="error-message" v-if="errors.description">{{ errors.description }}</p>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-button" 
                @click="handleCancel"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="save-button" 
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Status Messages -->
        <div class="status-message success" v-if="statusMessage.success">
          {{ statusMessage.success }}
        </div>
        <div class="status-message error" v-if="statusMessage.error">
          {{ statusMessage.error }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { UserManager } from '../api/user';
  import { useRouter } from 'vue-router';
  import { global } from '../api/global';
  
  const router = useRouter();
  const user_manager = new UserManager();
  
  // Form data
  const nickname = ref('');
  const description = ref('');
  const avatar = ref<File | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);
  const avatarPreview = ref<string | null>(null);
  
  // UI state
  const isSubmitting = ref(false);
  const errors = ref({
    nickname: '',
    description: ''
  });
  const statusMessage = ref({
    success: '',
    error: ''
  });
  
  // Computed properties
  const defaultAvatarUrl = computed(() => {
    if (UserManager.isLogin()) {
      const userId = localStorage.getItem("video-web-golang-uuid");
      return `${global.path}/user/get-avatar?user_id=${userId}&t=${Date.now()}`;
    }
    return `${window.location.protocol}//${window.location.host}/src/assets/imgs/default_user_avatar.png`;
  });
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInput.value) {
      fileInput.value.click();
    }
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        statusMessage.value.error = '请选择图片文件';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        statusMessage.value.error = '图片大小不能超过5MB';
        return;
      }
      
      // Set avatar file and create preview
      avatar.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error
      statusMessage.value.error = '';
    }
  };
  
  // Form validation
  const validateForm = () => {
    let isValid = true;
    errors.value.nickname = '';
    errors.value.description = '';
    
    if (!nickname.value.trim()) {
      errors.value.nickname = '昵称不能为空';
      isValid = false;
    } else if (nickname.value.length > 20) {
      errors.value.nickname = '昵称不能超过20个字符';
      isValid = false;
    }
    
    if (description.value.length > 200) {
      errors.value.description = '个人简介不能超过200个字符';
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Check login status
    if (!UserManager.isLogin()) {
      router.push({ name: "RegisterAndLogin" });
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      isSubmitting.value = true;
      statusMessage.value = { success: '', error: '' };
      
      // Update profile info
      const infoUpdated = await user_manager.editUserInfo(nickname.value, description.value);
      
      // Upload avatar if selected
      let avatarUpdated = true;
      if (avatar.value) {
        const formData = new FormData();
        formData.append('avatar', avatar.value);
        
        // Create a new instance of FormData and append the avatar file
        avatarUpdated = await uploadAvatarWithFormData(avatar.value);
      }
      
      // Show success or error message
      if (infoUpdated && avatarUpdated) {
        statusMessage.value.success = '个人资料更新成功';
        setTimeout(() => {
          router.push({ 
            name: 'Profile', 
            params: { username: localStorage.getItem("video-web-golang-username") || '' } 
          });
        }, 1500);
      } else {
        statusMessage.value.error = '更新失败，请稍后重试';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      statusMessage.value.error = '发生错误，请稍后重试';
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Helper function to upload avatar with FormData
  const uploadAvatarWithFormData = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${user_manager.uri_}/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': global.token
        },
        body: formData
      });
      
      const data = await response.json();
      return response.status === 200 && data.code === 200;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      return false;
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    router.back();
  };
  
  // Load user data on component mount
  onMounted(async () => {
    if (!UserManager.isLogin()) {
      router.push({ name: "RegisterAndLogin" });
      return;
    }
    
    try {
      const user_info = await user_manager.getUserInfo();
      if (user_info) {
        nickname.value = user_info.nickname || '';
        description.value = user_info.description || '';
      } else {
        statusMessage.value.error = '无法获取用户信息';
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      statusMessage.value.error = '获取用户信息失败';
    }
  });
  </script>
  
  <style scoped>
  .edit-profile-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
  }
  
  .edit-profile-card {
    background-color: var(--box-bgc);
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    padding: 30px;
    transition: box-shadow 0.3s ease;
  }
  
  .edit-profile-card:hover {
    box-shadow: var(--boxHoverShadow);
  }
  
  .card-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--fontNormal);
    margin: 0 0 8px 0;
  }
  
  .page-subtitle {
    color: var(--fontNormal);
    opacity: 0.7;
    margin: 0;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  
  /* Avatar Section */
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .avatar-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .avatar-preview:hover {
    transform: scale(1.05);
  }
  
  .avatar-preview:hover .avatar-overlay {
    opacity: 1;
  }
  
  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
  }
  
  .upload-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .upload-text {
    font-size: 12px;
  }
  
  .file-input {
    display: none;
  }
  
  /* Form Styles */
  .profile-form {
    width: 100%;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--fontNormal);
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--hover-color);
    border-radius: 8px;
    background-color: var(--content-bgc);
    color: var(--fontNormal);
    font-size: 16px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  
  .form-group input.error,
  .form-group textarea.error {
    border-color: #ef4444;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 5px;
  }
  
  /* Form Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
  }
  
  .cancel-button,
  .save-button {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .cancel-button {
    background-color: transparent;
    border: 1px solid var(--hover-color);
    color: var(--fontNormal);
  }
  
  .cancel-button:hover {
    background-color: var(--hover-color);
  }
  
  .save-button {
    background-color: #6366f1;
    border: none;
    color: white;
  }
  
  .save-button:hover:not(:disabled) {
    background-color: #4f46e5;
  }
  
  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Status Messages */
  .status-message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
  }
  
  .status-message.success {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }
  
  .status-message.error {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  /* Responsive Design */
  @media (max-width: 600px) {
    .edit-profile-card {
      padding: 20px;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .cancel-button,
    .save-button {
      width: 100%;
    }
  }
  </style>
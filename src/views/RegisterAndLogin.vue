<script setup lang="ts">
import { ref, computed } from 'vue';
import { NForm, NFormItem, NInput, NButton, useMessage, NCard, NDivider } from "naive-ui";
import { useRouter } from "vue-router";
import { UserManager } from "../api/user";

const isLogin = ref(true);
const loading = ref(false);
const codeLoading = ref(false);
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  email: '',
});

const message = useMessage();
const user_manager = new UserManager();
const router = useRouter();

const getCode = async () => {
  if (!formData.value.email) {
    message.warning("请先输入邮箱");
    return;
  }
  
  codeLoading.value = true;
  try {
    if (await user_manager.getCode(formData.value.email)) {
      message.success("验证码已发送，请检查您的邮箱");
    } else {
      message.error("验证码获取失败!");
    }
  } catch (error) {
    message.error("发生错误，请稍后重试");
  } finally {
    codeLoading.value = false;
  }
}

const login = async () => {
  if (!isLogin.value && formData.value.password !== formData.value.confirmPassword) {
    message.warning("两次密码不一致!");
    return;
  }
  
  if (!formData.value.email) {
    message.warning("请输入邮箱");
    return;
  }
  
  if (!formData.value.password) {
    message.warning("请输入密码");
    return;
  }
  
  if (!isLogin.value && !formData.value.username) {
    message.warning("请输入用户名");
    return;
  }
  
  if (!isLogin.value && !formData.value.code) {
    message.warning("请输入验证码");
    return;
  }
  
  loading.value = true;
  try {
    if (await user_manager.registerAndLogin({
      "email": formData.value.email,
      "code": formData.value.code,
      "nickname": formData.value.username,
      "password": formData.value.password
    })) {
      message.success(isLogin.value ? "登录成功" : "注册成功");
      router.push({"name": "Index"}).then(() => {
        location.reload();
      });
    } else {
      message.error(isLogin.value ? "登录失败" : "注册失败");
    }
  } catch (error) {
    message.error("发生错误，请稍后重试");
  } finally {
    loading.value = false;
  }
}

const title = computed(() => isLogin.value ? '欢迎回来' : '创建新账号');
const subtitle = computed(() => isLogin.value ? '请登录您的账号' : '请填写以下信息完成注册');
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <n-card class="auth-card" :bordered="false">
        <div class="auth-header">
          <div class="logo-container">
            <div class="logo">
              <img src="../assets/imgs/video_web_logo.png" alt="logo" class="logo-image">
            </div>
          </div>
          <h1 class="auth-title">{{ title }}</h1>
          <p class="auth-subtitle">{{ subtitle }}</p>
        </div>
        
        <n-form class="auth-form">
          <n-form-item>
            <n-input
              v-model:value="formData.email"
              placeholder="请输入邮箱"
              class="auth-input"
              :round="true"
            >
              <template #prefix>
                <span class="input-icon">✉️</span>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item v-if="!isLogin">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入用户名"
              class="auth-input"
              :round="true"
            >
              <template #prefix>
                <span class="input-icon">👤</span>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item>
            <n-input
              v-model:value="formData.password"
              type="password"
              placeholder="请输入密码"
              class="auth-input"
              :round="true"
              show-password-on="click"
            >
              <template #prefix>
                <span class="input-icon">🔒</span>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item v-if="!isLogin">
            <n-input
              v-model:value="formData.confirmPassword"
              type="password"
              placeholder="请确认密码"
              class="auth-input"
              :round="true"
              show-password-on="click"
            >
              <template #prefix>
                <span class="input-icon">🔒</span>
              </template>
            </n-input>
          </n-form-item>
          
          <n-form-item v-if="!isLogin" class="verification-code-container">
            <n-input
              v-model:value="formData.code"
              placeholder="请输入验证码"
              class="auth-input verification-input"
              :round="true"
            >
              <template #prefix>
                <span class="input-icon">🔑</span>
              </template>
            </n-input>
            <n-button
              class="get-code-button"
              :loading="codeLoading"
              :disabled="codeLoading || !formData.email"
              @click="getCode"
              type="primary"
              :round="true"
            >
              获取验证码
            </n-button>
          </n-form-item>
          
          <div class="auth-actions">
            <n-button
              type="primary"
              block
              @click="login"
              :loading="loading"
              class="submit-button"
              :round="true"
            >
              {{ isLogin ? '登录' : '注册' }}
            </n-button>
          </div>
        </n-form>
        
        <n-divider>或者</n-divider>
        
        <div class="toggle-mode">
          <p>{{ isLogin ? '还没有账号?' : '已有账号?' }}</p>
          <n-button
            text
            type="primary"
            @click="isLogin = !isLogin"
            class="toggle-button"
          >
            {{ isLogin ? '立即注册' : '立即登录' }}
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>
  
<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--video-card-bgc);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: var(--video-card-bgc);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--fontNormal);
}

.auth-subtitle {
  font-size: 16px;
  margin: 0;
  color: var(--fontNormal);
}

.auth-form {
  margin-bottom: 16px;
}

.auth-input {
  height: 48px;
  display: flex;
  align-items: center;
}

.input-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.verification-code-container {
  display: flex;
  gap: 12px;
}

.verification-input {
  flex: 1;
}

.get-code-button {
  white-space: nowrap;
  height: 48px;
}

.auth-actions {
  margin-top: 24px;
}

.submit-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.toggle-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--fontNormal);
}

.toggle-mode p {
  margin: 0;
}

.toggle-button {
  font-weight: 500;
  padding: 0;
}

@media (max-width: 576px) {
  .auth-container {
    max-width: 100%;
  }
  
  .verification-code-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .get-code-button {
    width: 100%;
  }
}

.logo-image {
    width: 80px;
    height: auto;
    object-fit: contain;
}

:deep(.n-input__input-el) {
  line-height: 48px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
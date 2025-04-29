<script setup lang="ts">
import { ref, computed } from 'vue';
import { NForm, NFormItem, NInput, NButton, useMessage, NCard, NDivider, NTabs, NTabPane } from "naive-ui";
import { useRouter } from "vue-router";
import { UserManager } from "../api/user";

// Auth mode state
const activeTab = ref('login');
const loading = ref(false);
const codeLoading = ref(false);

// Form data for different modes
const loginData = ref({
  email: '',
  password: '',
});

const registerData = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
});

const resetPasswordData = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
});

const message = useMessage();
const user_manager = new UserManager();
const router = useRouter();

// Get verification code for registration or password reset
const getCode = async (email: string, mode: string) => {
  if (!email) {
    message.warning("请先输入邮箱");
    return;
  }
  
  codeLoading.value = true;
  try {
    if (await user_manager.getCode(email)) {
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

// Handle login
const handleLogin = async () => {
  if (!loginData.value.email) {
    message.warning("请输入邮箱");
    return;
  }
  
  if (!loginData.value.password) {
    message.warning("请输入密码");
    return;
  }
  
  loading.value = true;
  try {
    const loginResult = await user_manager.registerAndLogin({
      "email": loginData.value.email,
      "password": loginData.value.password,
      "code": "",
      "nickname": ""
    });
    if (loginResult) {
      message.success("登录成功");
      router.push({"name": "Index"}).then(() => {
        location.reload();
      });
    } else {
      message.error("登录失败");
    }
  } catch (error) {
    message.error("发生错误，请稍后重试");
  } finally {
    loading.value = false;
  }
}

// Handle registration
const handleRegister = async () => {
  if (!registerData.value.email) {
    message.warning("请输入邮箱");
    return;
  }
  
  if (!registerData.value.username) {
    message.warning("请输入用户名");
    return;
  }
  
  if (!registerData.value.password) {
    message.warning("请输入密码");
    return;
  }
  
  if (registerData.value.password !== registerData.value.confirmPassword) {
    message.warning("两次密码不一致!");
    return;
  }
  
  if (!registerData.value.code) {
    message.warning("请输入验证码");
    return;
  }
  
  loading.value = true;
  try {
    const registerResult = await user_manager.registerAndLogin({
      "email": registerData.value.email,
      "code": registerData.value.code,
      "nickname": registerData.value.username,
      "password": registerData.value.password
    });
    if (registerResult) {
      message.success("注册成功");
      router.push({"name": "Index"}).then(() => {
        location.reload();
      });
    } else {
      message.error("注册失败");
    }
  } catch (error) {
    message.error("发生错误，请稍后重试");
  } finally {
    loading.value = false;
  }
}

// Handle password reset
const handleResetPassword = async () => {
  if (!resetPasswordData.value.email) {
    message.warning("请输入邮箱");
    return;
  }
  
  if (!resetPasswordData.value.code) {
    message.warning("请输入验证码");
    return;
  }
  
  if (!resetPasswordData.value.password) {
    message.warning("请输入新密码");
    return;
  }
  
  if (resetPasswordData.value.password !== resetPasswordData.value.confirmPassword) {
    message.warning("两次密码不一致!");
    return;
  }
  
  loading.value = true;
  try {
    const updatePasswordResult = await user_manager.updatePassword({
      "email": resetPasswordData.value.email,
      "code": resetPasswordData.value.code,
      "password": resetPasswordData.value.password,
      "nickname": ""
    });
    if (updatePasswordResult) {
      message.success("密码重置成功，请使用新密码登录");
      activeTab.value = 'login';
      resetPasswordData.value = {
        email: '',
        code: '',
        password: '',
        confirmPassword: '',
      };
    } else {
      message.error("密码重置失败");
    }
  } catch (error) {
    message.error("发生错误，请稍后重试");
  } finally {
    loading.value = false;
  }
}
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
        </div>
        
        <n-tabs v-model:value="activeTab" type="line" animated class="auth-tabs">
          <n-tab-pane name="login" tab="登录">
            <div class="tab-content">
              <h1 class="auth-title">欢迎回来</h1>
              <p class="auth-subtitle">请登录您的账号</p>
              
              <n-form class="auth-form">
                <n-form-item>
                  <n-input
                    v-model:value="loginData.email"
                    placeholder="请输入邮箱"
                    class="auth-input"
                    :round="true"
                  >
                    <template #prefix>
                      <span class="input-icon">✉️</span>
                    </template>
                  </n-input>
                </n-form-item>
                
                <n-form-item>
                  <n-input
                    v-model:value="loginData.password"
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
                
                <div class="forgot-password">
                  <a href="#" @click.prevent="activeTab = 'reset'">忘记密码?</a>
                </div>
                
                <div class="auth-actions">
                  <n-button
                    type="primary"
                    block
                    @click="handleLogin"
                    :loading="loading"
                    class="submit-button"
                    :round="true"
                  >
                    登录
                  </n-button>
                </div>
              </n-form>
              
              <div class="toggle-mode">
                <p>还没有账号?</p>
                <n-button
                  text
                  type="primary"
                  @click="activeTab = 'register'"
                  class="toggle-button"
                >
                  立即注册
                </n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="register" tab="注册">
            <div class="tab-content">
              <h1 class="auth-title">创建新账号</h1>
              <p class="auth-subtitle">请填写以下信息完成注册</p>
              
              <n-form class="auth-form">
                <n-form-item>
                  <n-input
                    v-model:value="registerData.email"
                    placeholder="请输入邮箱"
                    class="auth-input"
                    :round="true"
                  >
                    <template #prefix>
                      <span class="input-icon">✉️</span>
                    </template>
                  </n-input>
                </n-form-item>
                
                <n-form-item>
                  <n-input
                    v-model:value="registerData.username"
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
                    v-model:value="registerData.password"
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
                
                <n-form-item>
                  <n-input
                    v-model:value="registerData.confirmPassword"
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
                
                <n-form-item class="verification-code-container">
                  <n-input
                    v-model:value="registerData.code"
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
                    :disabled="codeLoading || !registerData.email"
                    @click="getCode(registerData.email, 'register')"
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
                    @click="handleRegister"
                    :loading="loading"
                    class="submit-button"
                    :round="true"
                  >
                    注册
                  </n-button>
                </div>
              </n-form>
              
              <div class="toggle-mode">
                <p>已有账号?</p>
                <n-button
                  text
                  type="primary"
                  @click="activeTab = 'login'"
                  class="toggle-button"
                >
                  立即登录
                </n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="reset" tab="重置密码">
            <div class="tab-content">
              <h1 class="auth-title">重置密码</h1>
              <p class="auth-subtitle">请填写以下信息重置您的密码</p>
              
              <n-form class="auth-form">
                <n-form-item>
                  <n-input
                    v-model:value="resetPasswordData.email"
                    placeholder="请输入邮箱"
                    class="auth-input"
                    :round="true"
                  >
                    <template #prefix>
                      <span class="input-icon">✉️</span>
                    </template>
                  </n-input>
                </n-form-item>
                
                <n-form-item class="verification-code-container">
                  <n-input
                    v-model:value="resetPasswordData.code"
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
                    :disabled="codeLoading || !resetPasswordData.email"
                    @click="getCode(resetPasswordData.email, 'reset')"
                    type="primary"
                    :round="true"
                  >
                    获取验证码
                  </n-button>
                </n-form-item>
                
                <n-form-item>
                  <n-input
                    v-model:value="resetPasswordData.password"
                    type="password"
                    placeholder="请输入新密码"
                    class="auth-input"
                    :round="true"
                    show-password-on="click"
                  >
                    <template #prefix>
                      <span class="input-icon">🔒</span>
                    </template>
                  </n-input>
                </n-form-item>
                
                <n-form-item>
                  <n-input
                    v-model:value="resetPasswordData.confirmPassword"
                    type="password"
                    placeholder="请确认新密码"
                    class="auth-input"
                    :round="true"
                    show-password-on="click"
                  >
                    <template #prefix>
                      <span class="input-icon">🔒</span>
                    </template>
                  </n-input>
                </n-form-item>
                
                <div class="auth-actions">
                  <n-button
                    type="primary"
                    block
                    @click="handleResetPassword"
                    :loading="loading"
                    class="submit-button"
                    :round="true"
                  >
                    重置密码
                  </n-button>
                </div>
              </n-form>
              
              <div class="toggle-mode">
                <p>记起密码了?</p>
                <n-button
                  text
                  type="primary"
                  @click="activeTab = 'login'"
                  class="toggle-button"
                >
                  返回登录
                </n-button>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
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
  background-color: var(--box-bgc);
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
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

.auth-tabs {
  margin-bottom: 20px;
}

.tab-content {
  padding: 10px 0;
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--fontNormal);
  text-align: center;
}

.auth-subtitle {
  font-size: 16px;
  margin: 0 0 24px 0;
  color: var(--fontNormal);
  opacity: 0.7;
  text-align: center;
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

.forgot-password {
  text-align: right;
  margin-bottom: 16px;
}

.forgot-password a {
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  text-decoration: underline;
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
  margin-top: 16px;
  color: var(--fontNormal);
}

.toggle-mode p {
  margin: 0;
}

.toggle-button {
  font-weight: 500;
  padding: 0;
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

:deep(.n-tabs-tab) {
  font-size: 16px;
  padding: 12px 20px;
}

:deep(.n-tabs-tab.n-tabs-tab--active) {
  font-weight: 600;
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
  
  .auth-title {
    font-size: 20px;
  }
  
  .auth-subtitle {
    font-size: 14px;
  }
}
</style>
<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui';
import Navigation from './components/Navigation.vue';
import Footer from "./components/Footer.vue";
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { initWebSocket, cleanupWebSocket, newMessageCount } from './api/websocket';
import { UserManager } from './api/user';
import { setCurrentContact } from './api/message';
import { ref } from 'vue';

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

// 组件挂载
onMounted(() => {
  initializeTheme();
  if (UserManager.isLogin()) {
    initWebSocket();
  }
});

// 组件卸载清理
onUnmounted(() => {
  cleanupWebSocket();
});

// 路由监听
const route = useRoute();
const currentRoutePath = ref(route.path);

watchEffect(() => {
  currentRoutePath.value = route.path;
});

watchEffect(() => {
  if (currentRoutePath.value !== '/message') {
    // 离开消息页面时，清除当前选中的联系人
    setCurrentContact(null);
  }
});
</script>

<template>
  <div id="app">
    <Navigation :newMessageCount="newMessageCount" />
    <Suspense>
      <n-message-provider>
        <n-dialog-provider>
          <router-view/>
        </n-dialog-provider>
      </n-message-provider>
    </Suspense>
    <Footer/>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
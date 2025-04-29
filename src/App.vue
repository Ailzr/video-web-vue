<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui';
import Navigation from './components/Navigation.vue';
import Footer from "./components/Footer.vue";
import { onMounted, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { global } from './api/global';
// WebSocket 连接
const socket = ref<WebSocket | null>(null);
const newMessageCount = ref(3);

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

// 初始化 WebSocket 连接
function initWebSocket() {
  socket.value = new WebSocket(global.ws_path);

  socket.value.onopen = () => {
    console.log('WebSocket 连接已建立');
  };

  socket.value.onmessage = (event) => {
    newMessageCount.value++;
    // 可以在这里触发自定义事件，以便在各个组件中监听
    window.dispatchEvent(new CustomEvent('new-message', { detail: event.data }));
  };

  socket.value.onclose = () => {
    console.log('WebSocket 连接已关闭');
  };
}

onMounted(() => {
  initializeTheme();
  initWebSocket();
});

const route = useRoute();
watchEffect(() => {
  // 当路由切换时，重置新消息计数
  if (route.path === '/chat') {
    newMessageCount.value = 0;
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
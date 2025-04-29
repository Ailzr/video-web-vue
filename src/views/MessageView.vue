<template>
    <div>
      <h1>消息页面</h1>
      <div v-for="(message, index) in messages" :key="index">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from 'vue';
  
  const messages = ref<string[]>([]);
  
  onMounted(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail as string;
      messages.value.push(message);
    };
  
    window.addEventListener('new-message', handleNewMessage as EventListener);
  
    // 在组件卸载时移除事件监听
    const onUnmounted = () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener);
    };
    onUnmounted();
  });
  </script>
  
  <style scoped>
  /* 样式部分可根据需求添加 */
  </style>    
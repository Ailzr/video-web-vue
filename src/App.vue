<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from 'naive-ui';
import Navigation from './components/Navigation.vue';
import Footer from "./components/Footer.vue";
import { onMounted } from 'vue';  // 添加这行

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

// 添加这个
onMounted(() => {
  initializeTheme();
});
</script>

<template>
  <div id="app">
    <Navigation/>
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

<template>
  <VideoGrid :videos="videos" />
</template>

<script setup lang="ts">
import { myVideoManager } from "../api/myVideo.ts";
import { UserManager } from "../api/user.ts";
import VideoGrid from "../components/VideoGrid.vue";

//每次访问首页时刷新一下token，避免一直登录
const user_manager = new UserManager();
user_manager.refreshToken();

const my_video_manager = new myVideoManager();
const videos = await my_video_manager.getVideoList(1);
</script>

<style scoped>
</style>

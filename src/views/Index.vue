<template>
  <VideoGrid :videos="videos" />
</template>

<script setup lang="ts">
import { myVideoManager } from "../api/myVideo.ts";
import VideoGrid from "../components/VideoGrid.vue";

const my_video_manager = new myVideoManager();
const videos = await my_video_manager.getVideoList(1);
</script>

<style scoped>
</style>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {global} from "../api/global.ts";
import { myVideoManager } from "../api/myVideo.ts";

const path = global.path;

const route = useRoute();
const video_id = route.params.video_id as string; 
const video_url = path + "/video/get-video?video_id=" + video_id;

const my_video_manager = new myVideoManager();
</script>

<template>
    <div class="video-player-container">
      <video 
        controls
        :src="video_url" 
        class="video-player" 
        autoplay
        muted
        @play="my_video_manager.playVideo(video_id)"
      ></video>
    </div>
  </template>
  
  
  <style scoped>
  .video-player-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .video-player {
    width: 100%;
    max-width: 1080px;
    border-radius: 10px;
  }
  </style>
  
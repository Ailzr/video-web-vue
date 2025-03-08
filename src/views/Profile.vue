<script setup lang="ts">
import { UserManager } from '../api/user';
import { ref } from "vue";
import VideoGrid from '../components/VideoGrid.vue';
import { myVideoManager } from '../api/myVideo';

const user_manager = new UserManager();
const my_video_manager = new myVideoManager;
const page = ref(1);

const user_video_list = await user_manager.getUserVideo(page.value);
const video_list = await my_video_manager.getVideoListByIds(user_video_list);
</script>

<template>
    <VideoGrid :videos="video_list"/>
</template>

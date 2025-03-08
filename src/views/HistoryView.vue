<script setup lang="ts">
import { UserManager } from '../api/user';
import { ref } from "vue";
import VideoGrid from '../components/VideoGrid.vue';
import { myVideoManager } from '../api/myVideo';

const user_manager = new UserManager();
const my_video_manager = new myVideoManager;
const page = ref(1);

const history_list = await user_manager.getHistoryList(page.value);
const video_list = await my_video_manager.getVideoListByIds(history_list);
</script>

<template>
    <VideoGrid :videos="video_list"/>
</template>

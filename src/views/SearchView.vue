<script setup lang="ts">
import { useRoute } from "vue-router";
import { searchManager } from "../api/search";
import VideoGrid from "../components/VideoGrid.vue";
import my_video_manager from "../api/myVideo";

const route = useRoute();
const keyword = route.params.keyword as string; 

const search_manager = new searchManager();

const videoIds = await search_manager.search(keyword, 1);
let videos = null;
if (videoIds !== null){
    videos = await my_video_manager.getVideoListByIds(videoIds);
}
</script>

<template>
    <VideoGrid :videos="videos" v-if="videos !== null" />
    <h2 v-else class="content">什么都没搜索到呢，换个关键词试试吧</h2>
</template>

<style scoped>
.content {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
<script setup lang="ts">
import {ref} from "vue";
let isDarkMode = ref(false);
if (localStorage.getItem('video-web-golang-theme') === "true") {
    isDarkMode.value = true;
    document.body.classList.add("dark");
}

const toggleMode = ()=>{
    isDarkMode.value = !isDarkMode.value;
    if(isDarkMode.value){
        localStorage.setItem("video-web-golang-theme", "true");
        document.body.classList.add("dark");
    }else{
        localStorage.setItem("video-web-golang-theme", "false");
        document.body.classList.remove("dark");
    }
}
</script>

<template>
    <div class="foot">
        <span>@Author by Ailzr</span>
        <br>
        <span>2024</span>
        <button class="theme-toggle" @click="toggleMode">
            <img class="theme-img" v-show="isDarkMode" src="../assets/imgs/night-theme.png" alt="切换到日间模式">
            <img class="theme-img" v-show="!isDarkMode" src="../assets/imgs/day-theme.png" alt="切换到夜间模式">
        </button>
    </div>
</template>

<style scoped>
    .foot{
        /* border-top: 1px solid #2C2C2C; */
        border-top: 1px solid;
        vertical-align: middle;
        text-align: center;
        /* color: white; */
    }
    /* 固定在右下角的切换按钮样式 */
    .theme-toggle {
        position: fixed;
        width: 50px;
        height: 50px;
        bottom: 20px;
        right: 20px;
        background: var(--bg-color);
        border: none;
        padding: 0; /* 移除内边距，确保图像填充整个按钮 */
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex; /* 将按钮设置为 Flex 容器 */
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */
    }
    .theme-img {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
    }

    /* 可根据需要添加悬停效果 */
    .theme-toggle:hover {
        opacity: 0.8;
    }
</style>
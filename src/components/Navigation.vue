<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import { NPopover, NButton } from "naive-ui";
import { UserManager } from "../api/user";

const navLinks = [
    { text: '首页', href: '/' },
    { text: '导航', href: '/#' },
    { text: '导航', href: '/#' },
    { text: '导航', href: '/#' },
    { text: '导航', href: '/#' },
];

const userActions = [
  { text: '消息', href: '/#' },
  { text: '关注', href: '/#' },
  { text: '收藏', href: '/#' },
  { text: '历史', href: '/history' },
  { text: '上传', href: '/upload' },
]

const username = ref(localStorage.getItem("video-web-golang-username") || "游客");

const router = useRouter();

const search_keyword = ref("");

const refresh_username = ()=>{
  username.value = localStorage.getItem("video-web-golang-username") || "游客";
}

const go_user_page = ()=>{
  if (!UserManager.isLogin()){
    router.push({ name: "RegisterAndLogin" }).then(() => {
      location.reload(); // 强制刷新页面
    });
    return;
  }
  refresh_username();
  router.push({name: 'Profile', params: { username: username.value}});
}

const logout = ()=>{
  localStorage.removeItem("video-web-golang-token");
  localStorage.removeItem("video-web-golang-username");
  refresh_username();
}

const goSearch = (keyword: string) =>{
  if (keyword === ""){
    return;
  }
  router.push({name: 'Search', params: {keyword: keyword}}).then(()=> {
    location.reload();
  });
}
</script>

<template>
    <header class="navigation">
        <div class="nav-left">
          <img src="../assets/imgs/video_web_logo.png" alt="Logo" class="logo" @click="router.push({name: 'Index'})"/>
          <ul class="nav-ul">
              <li v-for="link in navLinks" :key="link.text">
                <a :href="link.href">{{ link.text }}</a>
              </li>
          </ul>
        </div>
        
        <!-- 搜索框 -->
        <div class="center_search_container">
          <div class="search_bar">
            <div class="search_input">
              <input type="text" id="search_content" v-model="search_keyword" @keyup.enter="goSearch(search_keyword)" />
            </div>
            <div class="search_btn">
              <button type="button" @click="goSearch(search_keyword)"></button>
            </div>
          </div>
        </div>

        <div class="nav-right">
          <ul class="nav-ul">
              <li v-for="action in userActions" :key="action.text">
                <a :href="action.href">{{ action.text }}</a>
              </li>

          </ul>
          <!-- 使用 NPopover 添加悬浮窗效果 -->
          <n-popover
          trigger="hover"
          placement="bottom"
          :width=200
          :style="{ padding: '0'}"
          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 0] } }] }"
          >
            <!-- 悬浮窗内容 -->
            <template #default>
              <div class="popover-content">
                <p>你好: {{ username }}</p>
                <n-button @click="logout" style="color: var(--fontNormal)" v-if="UserManager.isLogin()">登出</n-button>
              </div>
            </template>
            <!-- 头像部分 -->
            <template #trigger>
              <div class="user-avatar" @click="go_user_page">
                <img src="../assets/imgs/default_user_avatar.png" alt="User Avatar" />
              </div>
            </template>
          </n-popover>
        </div>
    </header>
</template>
  
<style scoped src="../assets/css/Navigation.css">
</style>
  
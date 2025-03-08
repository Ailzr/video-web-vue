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
  { text: '历史', href: '/#' },
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
              <div class="search_input"><input type="text" id="search_content" v-model="search_keyword"></div>
              <div class="search_btn"><button @click="router.push({name: 'Search', params: {keyword: search_keyword}})"></button></div>
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
                <n-button @click="logout" style="color: white;" v-if="UserManager.isLogin()">登出</n-button>
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
  
<style scoped>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0D0E11;
  color: #fff;
  padding: 10px 20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 20px;
  cursor: pointer;
}

.nav-ul {
  list-style-type: none;
  display: flex;
  gap: 15px;
}

.nav-ul li {
  font-size: 16px;
}

.nav-ul li a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-ul li a:hover {
  color: #ff9900;
}

.nav-center {
  display: flex;
  align-items: center;
}

/* 搜索栏 */
.center_search_container{
    display: inline-block;
    flex: 1 auto;
    min-width: 300px;
    max-width: 800px;
    height: 38px;
}

.search_bar{
    position: relative;
    margin: 0 auto;
    min-width: 181px;
    max-width: 500px;
    height: 38px;
    align-items: center;
    background-color: #1F2128;
    border-radius: 8px 8px 8px 8px;
}

.search_bar .search_input{
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 100%;
    height: 32px;
    border: 2px solid transparent;
}
.search_bar .search_input input{
    background-color: transparent;
    color: white;
    width: 92%;
    height: 32px;
    margin: auto 0;
    border-radius: 8px 8px 8px 8px;
    padding-left: 8px;
}

.search_bar .search_input input:focus{
    background-color: #434656;
}

.search_bar .search_btn{
    position: absolute;
    top: 3px;
    right: 7px;
    border-radius: 8px 8px 8px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background-color: transparent;
}

.search_bar .search_btn:hover{
    background-color: #1F2128;
}

.search_bar .search_btn button{
    width: 17px;
    height: 17px;
    border: none;
    background-color: transparent;
    background-image: url(../assets/imgs/magnifying.png);
    background-repeat: no-repeat;
    background-size: 100%;
}

.search_bar .search_btn button:hover{
    cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 15px;
  cursor: pointer;
}

.popover-content {
  background-color: #2C2C2C;
  padding: 10px;
  color: #fff;
  font-size: 16px;
}
</style>
  
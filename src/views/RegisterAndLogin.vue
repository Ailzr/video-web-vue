<script setup lang="ts">
import { ref } from 'vue';
import {NForm, NFormItem, NInput, NButton, useMessage} from "naive-ui";
import {useRouter} from "vue-router";
import {UserManager} from "../api/user";

const isLogin = ref(true);
const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  email: '',
});

const message = useMessage();

const user_manager = new UserManager();

const getCode = async ()=>{
    if(await user_manager.getCode(formData.value.email)){
        message.success("获取成功，请检查个人邮箱");
    }else{
        message.error("验证码获取失败!");
    }
}

const router = useRouter();

const login = async ()=>{
    if (!isLogin && formData.value.password !== formData.value.confirmPassword){
        message.warning("两次密码不一致!");
        return;
    }
    if(await user_manager.registerAndLogin({
        "email": formData.value.email,
        "code": formData.value.code,
        "nickname": formData.value.username,
        "password": formData.value.password
    })){
        router.push({"name": "Index"});
    }else{
        message.error(isLogin ? "注册失败":"登录失败");
    }
}
</script>

<template>
    <div class="auth-container">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <n-form class="auth-form">
            <n-form-item label="用户名">
                <n-input class="user-info" v-model:value="formData.email" placeholder="请输入邮箱" />
            </n-form-item>
            <n-form-item v-if="!isLogin" label="用户名">
                <n-input class="user-info" v-model:value="formData.username" placeholder="请输入用户名" />
            </n-form-item>
            <n-form-item label="密码">
                <n-input class="user-info" v-model:value="formData.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item v-if="!isLogin" label="确认密码">
                <n-input class="user-info" v-model:value="formData.confirmPassword" type="password" placeholder="请确认密码" />
            </n-form-item>
            <n-form-item v-if="!isLogin">
                <n-input class="user-info" v-model:value="formData.code" placeholder="请输入验证码" />
            </n-form-item>
            <div class="button-group">
                <n-button v-if="!isLogin" type="primary" @click="getCode">获取验证码</n-button>
                <n-button type="primary" @click="login">{{ isLogin ? '登录' : '注册' }}</n-button>
                <n-button text @click="isLogin = !isLogin" style="color: white;">{{ isLogin ? '没有账号？注册' : '已有账号？登录' }}</n-button>
            </div>
        </n-form>
    </div>
</template>
  
<style scoped>
  .auth-container {
    color: white;
    min-width: 540px;
    max-width: 720px;
    margin: 50px auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: #1F2128;
    text-align: center;
  }
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .user-info{
    margin: 0 auto;
    width: 50%;
  }
  .button-group {
        display: flex;
        flex-direction: column; /* 让按钮垂直排列 */
        gap: 10px; /* 按钮之间增加间距 */
        align-items: center; /* 让按钮在容器中居中 */
        width: 100%; /* 让按钮组占满父容器 */
    }
</style>
  
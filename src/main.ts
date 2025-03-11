import { createApp } from 'vue';
import {createRouter, createWebHistory} from "vue-router";

import './base.css';
import './assets/css/_theme.css';

import App from './App.vue';
import Index from "./views/Index.vue";
import VideoView from "./views/VideoView.vue";
import RegisterAndLogin from './views/RegisterAndLogin.vue';
import UploadView from './views/UploadView.vue';
import Profile from './views/Profile.vue';

const routes = [
    {
        name: "Index",
        path: "/",
        component: Index
    },
    {
        name: "Video",
        path: "/video/:video_id",
        component: VideoView
    },
    {
        name: "RegisterAndLogin",
        path: "/login",
        component: RegisterAndLogin
    },
    {
        name: "Upload",
        path: "/upload",
        component: UploadView
    },
    {
        name: "Profile",
        path: "/profile/:username",
        component: Profile
    }
]

const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
)

const app = createApp(App);
app.use(router);
app.mount('#app');
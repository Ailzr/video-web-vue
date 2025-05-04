import { createApp } from 'vue';
import {createRouter, createWebHistory} from "vue-router";

import './base.css';
import './assets/css/_theme.css';

import App from './App.vue';
import Index from "./views/Index.vue";
import VideoView from "./views/VideoView.vue";
import RegisterAndLogin from './views/RegisterAndLogin.vue';
import UploadView from './views/UploadView.vue';
import ProfileView from './views/ProfileView.vue';
import SearchView from "./views/SearchView.vue";
import HistoryView from './views/HistoryView.vue';
import EditProfile from './views/EditProfile.vue';
import MessageView from './views/MessageView.vue';
import FavoriteView from './views/FavoriteView.vue';
import FollowView from './views/FollowView.vue';
import CategoryView from './views/CategoryView.vue';

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
        path: "/profile/:user_id",
        component: ProfileView
    },
    {
        name: "History",
        path: "/history",
        component: HistoryView,
    },
    {
        name: "Search",
        path: "/search/:keyword",
        component: SearchView,
    },
    {
        name: "EditProfile",
        path: "/edit-profile",
        component: EditProfile
    },
    {
        name: "Message",
        path: "/message",
        component: MessageView
    },
    {
        name: "Favorite",
        path: "/favorites",
        component: FavoriteView
    },
    {
        name: "Following",
        path: "/following",
        component: FollowView
    },
    {
        name: 'Category',
        path: '/category/:categoryId?',
        component: CategoryView
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
import axios from "axios";
import {global} from "./global";
import DefaultAvatar from "../assets/imgs/default_user_avatar.png";

type User = {
    uuid?: string,
    email: string,
    code: string,
    nickname: string,
    password: string,
    avatar?: string,
    description?: string,
    is_followed?: boolean,
    fan_num?: number,
}


class UserManager{
    private uri_: string = `${global.path}/user`;

    public static isLogin(){
        if (global.token !== null && global.token !== ""){
            return true;
        }
        return false;
    }

    static get getUserId(): string{
        return localStorage.getItem("video-web-golang-uuid") || "";
    }

    static get avatarPath(): string{
        if (this.isLogin()) {
            return `${global.path}/user/userAvatar/` + localStorage.getItem("video-web-golang-uuid") + ".jpg";
        }
        return DefaultAvatar;
    }

    public async getCode(email:string) : Promise<Boolean> {
        let response = await axios.post(
            `${this.uri_}/send-code`,
            {
                "email": email
            }
        )
        if (response.status !== 200) {
            return false;
        }
        return response.data.code === 200;
    }

    public async registerAndLogin(user: User) {
        console.log(this.uri_);
        let response = await axios.post(
            `${this.uri_}/login`,
            {
                "email": user.email,
                "code": user.code,
                "nickname": user.nickname,
                "password": user.password,
            }
        )
        if (response.status !== 200){
            return false;
        }
        if (response.data.code === 200){
            localStorage.setItem("video-web-golang-token", response.data.data.token);
            localStorage.setItem("video-web-golang-uuid", response.data.data.uuid);
            localStorage.setItem("video-web-golang-username", response.data.data.nickname);
            return true;
        }
        return false;
    }

    public async updatePassword(user: User){
        let response = await axios.post(
            `${this.uri_}/update-pwd`,
            {
                "email": user.email,
                "code": user.code,
                "password": user.password
            }
        );
        if (response.status !== 200) {
            return false;
        }
        return response.data.code === 200;
    }

    public async getHistoryList(page: Number){
        let response = await axios.get(
            `${this.uri_}/get-history?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.history_list;
    }

    public async getUserVideo(page: Number){
        let response = await axios.get(
            `${this.uri_}/get-user-video?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null
        }
        return response.data.data.user_video_list;
    }

    public async refreshToken(){
        if (global.token === null || global.token === ""){
            return;
        }
        let response = await axios.get(
            `${this.uri_}/refresh-token`,
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
        if (response.status === 200){
            if (response.data.code !== 200){
                //如果响应码不是200说明token有错误，无法通过验证，清空一下token
                localStorage.removeItem("video-web-golang-token");
            }
            // console.log("刷新成功");
            localStorage.setItem("video-web-golang-token", response.data.data.token);
            // 把global存储的token也刷新一下
            global.token = response.data.data.token
            return;
        }
    }

    public async getAvatar(avatar: string): Promise<File | null> {
        try {
            const response = await axios.get(`${this.uri_}/${avatar}`);
            if (response.status === 200 && response.data.code === 200) {
                return response.data.avatar;
            }
            return null;
        } catch (error) {
            console.error('Failed to get avatar:', error);
            return null;
        }
    }
    
    public async editUserInfo(nickname: string, description: string): Promise<boolean> {
        try {
            const response = await axios.put(`${this.uri_}/edit`, {
                nickname,
                description
            }, {
                headers: {
                    Authorization: global.token
                }
            });
            return response.status === 200 && response.data.code === 200;
        } catch (error) {
            console.error('Failed to edit user info:', error);
            return false;
        }
    }

    public async uploadAvatar(avatar: File) {
        try {
            const formData = new FormData();
            formData.append("avatar", avatar);
            const response = await axios.post(`${this.uri_}/upload-avatar`, 
                formData, 
                {
                    headers: {
                        Authorization: global.token
                    }
                }
            );
            return response.status === 200 && response.data.code === 200;
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            return false;
        }
    }
    
    public async getUserInfo(): Promise<User | null> {
        try {
            const response = await axios.get(`${this.uri_}/info`, {
                headers: {
                    Authorization: global.token
                }
            });
            if (response.status === 200 && response.data.code === 200) {
                return response.data.data.user;
            }
            return null;
        } catch (error) {
            console.error('Failed to get user info:', error);
            return null;
        }
    }

    public async getUserInfoByUuid(uuid: string): Promise<User | null> {
        let response = await axios.get(`${this.uri_}/info/${uuid}`)
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.user;
    }
    
    // public async getUserProfile(): Promise<{email: string, nickname: string, description: string} | null> {
    //     try {
    //         const response = await axios.get(`${this.uri_}/profile`, {
    //             headers: {
    //                 Authorization: global.token
    //             }
    //         });
    //         if (response.status === 200 && response.data.code === 200) {
    //             return response.data.data;
    //         }
    //         return null;
    //     } catch (error) {
    //         console.error('Failed to get user profile:', error);
    //         return null;
    //     }
    // }
}

function getAvatarPath(avatar: string): string{
    if (avatar === ""){
        return DefaultAvatar;
    }
    return `${global.path}/user/${avatar}`;
}

export {UserManager, type User, getAvatarPath};

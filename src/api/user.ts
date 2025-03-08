import axios from "axios";
import {global} from "./global";

type User = {
    email: string,
    code: string,
    nickname: string,
    password: string
}


class UserManager{
    private uri_: string = `${global.path}/user`;

    public static isLogin(){
        let token = localStorage.getItem("video-web-golang-token");
        if (token !== null && token !== ""){
            return true;
        }
        return false;
    }

    public async getCode(email:string) : Promise<Boolean> {
        let response = await axios.post(
            `${this.uri_}/send-code`,
            {
                "email": email
            }
        )
        return response.data.code === 200;
    }

    public async registerAndLogin(user: User) {
        let response = await axios.post(
            `${this.uri_}/login`,
            {
                "email": user.email,
                "code": user.code,
                "nickname": user.nickname,
                "password": user.password,
            }
        )
        if (response.data.code === 200){
            localStorage.setItem("video-web-golang-token", response.data.data.token);
            localStorage.setItem("video-web-golang-username", response.data.data.nickname);
            return true;
        }
        return false;
    }

    public async updatePassword(){
        //TODO 更改密码
    }

    public async getHistoryList(page: Number){
        let token = localStorage.getItem("video-web-golang-token");
        let response = await axios.get(
            `${this.uri_}/get-history?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        )
        if (response.data.code !== 200){
            return null;
        }
        return response.data.data.history_list;
    }

    public async getUserVideo(page: Number){
        let token = localStorage.getItem("video-web-golang-token");
        let response = await axios.get(
            `${this.uri_}/get-user-video?page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        )
        if (response.data.code !== 200){
            return null;
        }
        return response.data.data.user_video_list;
    }
}

export {UserManager};
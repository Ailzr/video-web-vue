import axios from "axios";
import {global} from "./global.ts";

type myVideo = {
    uuid: string,
    updated_at: string,
    title: string,
    get_num: number,
    like_num: number,
    // user_name: string,
    type: string,
    face?: string,
}

class myVideoManager {
    private uri_: string = `${global.path}/video`;
    public async getVideoList(page:number){
        let response = await axios.get(
            `${this.uri_}/video-list?page=${page}`,
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.video_list;
    }

    public playVideo(videoId: string) {
        axios.put(
            `${this.uri_}/incr-get-num`, 
            {
                "video_id": videoId,
            },
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
    }

    public async uploadVideo(face: File, video: File, progressCallback?: (progressEvent: any) => void){
        const formData = new FormData();
        formData.append("face", face);
        formData.append("video", video);
        let response = await axios.post(
            `${this.uri_}/upload`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: progressEvent => {
                    if (progressCallback) {
                        progressCallback(progressEvent);
                    }
                }
            }
        )
        if (response.status !== 200){
            return false;
        }
        if (response.data.code === 200){
            return true;
        }else{
            console.log('上传错误:' + response.data.msg);
        }
        return false;
    }

    public async getVideoListByIds(videoIds: object[]) {
        let response = await axios.post(
            `${this.uri_}/get-video-list-by-ids`,
            videoIds,
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.video_list;
    }

    public async deleteVideo(videoId: string) : Promise<string>{
        let response = await axios.delete(
            `${this.uri_}/delete?video_id=${videoId}`,
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
        if (response.status !== 200){
            return "请求异常，删除失败";
        }
        if (response.data.code !== 200){
            return response.data.msg;
        }
        return "";
    }

}

export {myVideoManager}
export type {myVideo}
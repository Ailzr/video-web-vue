import axios from "axios";
import { global } from "./global";

class LikeManager {
    private uri_: string = `${global.path}/like`;
    public async updateLike(videoId: string) {
        let response = await axios.post(
            `${this.uri_}/update?video_id=${videoId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${global.token}`,
                }
            }
        )
        if (response.status !== 200){
            return "请求异常，更新点赞失败";
        }
        if (response.data.code !== 200){
            return response.data.msg;
        }
        return "";
    }
}

export default new LikeManager();
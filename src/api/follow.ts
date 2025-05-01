import axios from "axios";
import { global } from "./global";

class FollowManager {
    private uri_: string = `${global.path}/follow`;
    public async getFollowList(page: number) {
        const response = await axios.get(`${this.uri_}/get-follow-list?page=${page}`);
        return response.data.data.follow_list;
    }
    public async updateFollow(followedUserId: string) {
        const response = await axios.post(`${this.uri_}/update`, 
            {
                followed_user_id: followedUserId
            }, 
            {
                headers: {
                    Authorization: `Bearer ${global.token}`
                }
            }
        );
        console.log(response.data);
        return response.status === 200 && response.data.code === 200;
    }
}

export default new FollowManager();

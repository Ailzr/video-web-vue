import axios from "axios";
import { global } from "./global";
import { User } from "./user";

class FollowManager {
    private uri_: string = `${global.path}/follow`;
    public async getFollowList(page: number): Promise<User[]> {
        const response = await axios.get(`${this.uri_}/list?page=${page}`,{headers:{Authorization: `Bearer ${global.token}`}});
        if (response.status !== 200) {
            return [];
        }
        if (response.data.code !== 200) {
            return [];
        }
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
        return response.status === 200 && response.data.code === 200;
    }
}

export default new FollowManager();

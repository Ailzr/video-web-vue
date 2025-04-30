import axios from "axios";
import { global } from "./global.ts";

type Favorite = {
    uuid?: string;
    user_id: string;
    video_id: string;
    updated_at?: string;
}

class FavoriteManager{
    private uri_: string = `${global.path}/favorite`;

    public async getFavoriteList() {
        const response = await axios.get(`${this.uri_}/list`, { headers: { Authorization: `Bearer ${global.token}` } });
        if (response.status === 200 && response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error("Failed to get favorite list");
        }
    }

    public async updateFavorite(videoId: string) {
        const response = await axios.post(`${this.uri_}/update?video_id=${videoId}`,{}, { headers: { Authorization: `Bearer ${global.token}` } });
        if (response.status === 200 && response.data.code === 200) {
            return response.data.data;
        } else {
            throw new Error("Failed to update favorite");
        }
    }
}

export default new FavoriteManager();
export type { Favorite };
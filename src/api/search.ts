import axios from "axios";
import {global} from "./global";

class searchManager{
    private uri_: string = `${global.path}/search`;

    public async search(keyword: string, page: number){
        let response = await axios.get(
            `${this.uri_}?keyword=${keyword}&page=${page}`,
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.video_list;
    }
}

export {searchManager};
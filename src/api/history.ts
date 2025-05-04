import axios from 'axios'
import { global } from './global'

class HistoryManager {
    private uri_ = `${global.path}/history`

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

    public async clearAllHistory() {
        const res = await axios.delete(
            `${this.uri_}/delete`, 
            {
                headers: {
                    Authorization: `Bearer ${global.token}`
                }
            }
        )
        return res.status === 200 && res.data.code === 200
    }
}

export default new HistoryManager()

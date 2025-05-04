import axios from 'axios'
import { global } from './global'

class HistoryManager {
    private uri_ = `${global.path}/history`

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

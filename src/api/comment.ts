// type Comment struct {
// 	UUID      string `json:"uuid" gorm:"type:varchar(36);primary_key"`
// 	CreatedAt time.Time
// 	UpdatedAt time.Time
// 	DeletedAt gorm.DeletedAt `gorm:"index"`
// 	Content   string         `json:"content" gorm:"type:varchar(255)"`                          //评论内容
// 	VideoId   string         `json:"video_id" gorm:"type:varchar(36);foreign_key:videos(uuid)"` //视频id
// 	UserId    string         `json:"user_id" gorm:"type:varchar(36);foreign_key:users(uuid)"`   //评论用户id
// }
import axios from "axios";
import {global} from "./global.ts";
import type {User} from "./user.ts";

type Comment = {
    uuid: string,
    content: string,
    video_id: string,
    updated_at?: string,
    user?: User,
}

class CommentManager {
    private uri_: string = `${global.path}/comment`;
    public async getCommentList(videoId: string) {
        let response = await axios.get(
            `${this.uri_}/get-comment-list?video_id=${videoId}`,
            {
                headers: {
                    'Authorization': `Bearer ${global.token}`
                }
            }
        )
        if (response.status !== 200 || response.data.code !== 200){
            return null;
        }
        return response.data.data.comment_list;
    }

    public async addComment(comment: Comment) {
        let response = await axios.post(
            `${this.uri_}/create`,
            comment,
            {
                headers: {
                    'Authorization': `Bearer ${global.token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        if (response.status !== 200 || response.data.code !== 200){
            return false;
        }
        return true;
    }

    public async deleteComment(commentId: string) {
        let response = await axios.delete(
            `${this.uri_}/delete?comment_id=${commentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${global.token}`
                }
            }
        )
        if (response.status !== 200 || response.data.code !== 200){
            return false;
        }
        return true;
    }
}

export default new CommentManager();
export type {Comment};

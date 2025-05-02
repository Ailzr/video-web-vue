export const global = {
    path: import.meta.env.VITE_API_HOST + "/apis" || `${window.location.protocol}//${window.location.hostname}:80/apis`,
    ws_path: import.meta.env.VITE_WS_HOST + "/apis/ws" || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:80/apis/ws`,
    token: localStorage.getItem('video-web-golang-token') || '',
    socket: null as WebSocket | null,
    currentChatUser: null as string | null
};

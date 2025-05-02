export const global = {
    path: import.meta.env.VITE_API_HOST + "/apis" || `${window.location.protocol}//${window.location.hostname}:80/apis`,
    ws_path: import.meta.env.VITE_WS_HOST + "/ws" || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:80/ws`,
    token: localStorage.getItem('video-web-golang-token') || '',
    socket: null as WebSocket | null,
    currentChatUser: null as string | null
};

type returnInfo<T> = {
    code: number,
    msg: string,
    data?: T,
}

class global{
    private static get apiBase(): string {
        return import.meta.env.VITE_API_HOST || 
            `${window.location.protocol}//${window.location.hostname}:80`;
    }

    private static get wsBase(): string {
        return import.meta.env.VITE_WS_HOST || 
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:80`;
    }

    static get path(): string{
        return this.apiBase + "/apis";
    }

    static get token(): string{
        return localStorage.getItem("video-web-golang-token") || "";
    }

    static get ws_path(): string{
        return this.wsBase + "/ws";
    }
}

export {global};
export type {returnInfo}
type returnInfo<T> = {
    code: number,
    msg: string,
    data?: T,
}

class global{
    private static path_: string = `${window.location.protocol}//${window.location.hostname}:8080`;
    private static ws_path_: string = `${window.location.protocol}//${window.location.hostname}:8080/ws`;

    static get path(): string{
        return this.path_ + "/apis";
    }

    static get token(): string{
        return localStorage.getItem("video-web-golang-token") || "";
    }

    static get ws_path(): string{
        return this.ws_path_;
    }
}

export {global};
export type {returnInfo}
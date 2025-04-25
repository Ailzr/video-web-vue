type returnInfo<T> = {
    code: number,
    msg: string,
    data?: T,
}

class global{
    private static path_: string = `${window.location.protocol}//${window.location.hostname}:8080`;

    static get path(): string{
        return this.path_ + "/apis";
    }

    static get token(): string{
        return localStorage.getItem("video-web-golang-token") || "";
    }
}

export {global};
export type {returnInfo}
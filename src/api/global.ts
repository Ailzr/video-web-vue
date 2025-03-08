type returnInfo<T> = {
    code: number,
    msg: string,
    data?: T,
}

class global{
    private static path_: string = `http://10.208.88.71:8080`;

    static get path(): string{
        return this.path_ + "/apis";
    }
}

export {global};
export type {returnInfo}
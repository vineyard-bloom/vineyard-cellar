export interface CellarClient {
    client: any;
    config: any;
    send: Promise<any>;
}
export declare class S3CellarClient implements CellarClient {
    client: any;
    private config;
    constructor(config: any);
    send(localPath: string, remotePath: string): Promise<{}>;
}

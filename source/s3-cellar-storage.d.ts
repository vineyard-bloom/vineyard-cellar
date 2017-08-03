export interface S3CellarStorageConfig {
    defaultBucket: string;
    client: any;
}
export declare class S3CellarStorage {
    private client;
    private config;
    constructor(config: S3CellarStorageConfig);
    store(localPath: string, remotePath: string): Promise<{}>;
}

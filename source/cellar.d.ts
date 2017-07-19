import { Request } from 'vineyard-lawn';
import { Collection } from "vineyard-ground";
export interface File {
    filename: string;
    path: string;
    extension: string;
    size: number;
}
export interface PathConfig {
    temp: string;
}
export interface CellarConfig {
    s3: any;
    paths: PathConfig;
    defaultBucket?: string;
    useMock: boolean;
}
export declare class Cellar {
    private fileCollection;
    private s3Client;
    private config;
    constructor(fileCollection: Collection<File>, config: CellarConfig);
    singleFile(name?: string): any;
    getConfig(): CellarConfig;
    private sendToS3(localPath, remotePath, bucket);
    createFile(name: string, fields: any, file: any): any;
    private uploadFile(name, fields, bucket, file);
    upload(name: string, fields: any, bucket: string, request: Request): Promise<{
        file: never;
    }>;
}

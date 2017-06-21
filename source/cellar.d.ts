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
}
export declare class Cellar {
    private fileCollection;
    private s3Client;
    private config;
    constructor(fileCollection: Collection<File>, config: CellarConfig);
    integrate(app: any): void;
    private sendToS3(localPath, remotePath, bucket);
    upload(name: string, fields: any, bucket: string, request: Request, req: any): Promise<{
        files: any[];
    }>;
}

import { Request } from 'vineyard-lawn';
import { Collection } from "vineyard-ground";
import { CellarClient } from "./cellar-client";
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
    paths: PathConfig;
    useMock: boolean;
}
export declare class Cellar {
    private fileCollection;
    private client;
    private config;
    constructor(fileCollection: Collection<File>, config: CellarConfig, client: CellarClient);
    singleFile(name?: string): any;
    getConfig(): CellarConfig;
    createFile(name: string, fields: any, file: any): any;
    private uploadFile(name, fields, file);
    upload(name: string, fields: any, request: Request): Promise<any>;
}

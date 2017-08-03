import { Request } from 'vineyard-lawn';
import { Collection } from "vineyard-ground";
import { CellarStorage } from "./types";
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
}
export declare class Cellar {
    private fileCollection;
    private storage;
    private config;
    constructor(fileCollection: Collection<File>, config: CellarConfig, storage: CellarStorage);
    singleFile(name?: string): any;
    getConfig(): CellarConfig;
    createFile(name: string, fields: any, file: any): any;
    private uploadFile(name, fields, file);
    upload(name: string, fields: any, request: Request): Promise<never>;
}

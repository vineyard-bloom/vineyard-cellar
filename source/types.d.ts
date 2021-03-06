export interface CellarStorage {
    store: (localPath: string, remotePath: string) => Promise<any>;
    retrieve: (localPath: string, remotePath: string) => Promise<any>;
}

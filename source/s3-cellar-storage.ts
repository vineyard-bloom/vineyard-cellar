const s3 = require('s3')

export interface S3CellarStorageConfig {
  defaultBucket: string
  client
}

export class S3CellarStorage {
  private client
  private config:S3CellarStorageConfig

  constructor(config:S3CellarStorageConfig) {
    this.config = config
    this.client = s3.createClient(this.config.client)
  }

  store(localPath: string, remotePath: string) {
    const params = {
      localFile: localPath,
      s3Params: {
        Bucket: this.config.defaultBucket,
        Key: remotePath,
      },
    }

    return new Promise((resolve, reject) => {
      const uploader = this.client.uploadFile(params)
      uploader.on('error', function (error) {
        reject(error)
      })
      uploader.on('end', function () {
        resolve()
      })
    })
  }

  retrieve(localPath:string, remotePath:string) {
    const params = {
      localFile: localPath,
      s3Params: {
        Bucket: this.config.defaultBucket,
        Key: remotePath,
      },
    }

    return new Promise((resolve, reject) => {
      const downloader = this.client.downloadFile(params)
      downloader.on('error', function (error) {
        reject(error)
      })
      downloader.on('end', function () {
        resolve(localPath)
      })
    })
  }

}

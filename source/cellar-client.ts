const s3 = require('s3')

export interface CellarClient {
  client
  config
  send: Promise<any>
}

export class S3CellarClient {
  client
  private config

  constructor(config) {
    this.config = config.s3
    this.client = s3.createClient(this.config)
  }

  send(localPath: string, remotePath: string) {
    const params = {
      localFile: localPath,

      s3Params: {
        Bucket: this.config.bucket,
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

}

/**
 * Created by patrickmedaugh on 8/1/17.
 */

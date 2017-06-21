import {Request, BadRequest} from 'vineyard-lawn'
import {Collection} from "vineyard-ground"
const multer = require('multer')
const s3 = require('s3')

export interface File {
  filename: string
  path: string
  extension: string
  size: number
}

function getFiles(files) {
  return Array.isArray(files)
    ? files
    : [files]
}

export interface PathConfig {
  temp: string
}

export interface CellarConfig {
  s3: any
  paths: PathConfig
  defaultBucket?: string
}

export class Cellar {
  private fileCollection: Collection<File>
  private s3Client
  private config: CellarConfig

  constructor(fileCollection: Collection<File>, config: CellarConfig) {
    this.fileCollection = fileCollection
    this.s3Client = s3.createClient(config)
    this.config = config
  }

  integrate(app) {
    app.use(multer({dest: this.config.paths.temp}))
  }

  getConfig(): CellarConfig {
    return this.config
  }

  private sendToS3(localPath: string, remotePath: string, bucket: string) {
    const params = {
      localFile: localPath,

      s3Params: {
        Bucket: bucket,
        Key: remotePath,
      },
    }
    return new Promise((resolve, reject) => {
      const uploader = this.s3Client.uploadFile(params)
      uploader.on('error', function (error) {
        reject(error)
      })
      uploader.on('end', function () {
        resolve()
      })
    })
  }

  upload(name: string, fields, bucket: string, request: Request, req) {
    const files = getFiles(req.files)

    const result = []
    const promises = files.map((file) => {
      const path = require('path')
      const ext = path.extname(file.originalname) || ''
      const filename = name + ext

      const entity = Object.assign({
        filename: filename,
        path: file.path,
        extension: ext.substring(1),
        size: file.size,
      }, fields)

      return this.fileCollection.create(entity)
        .then(record => {
          result.push(record)
          return this.sendToS3(file.path, filename, bucket)
        })
    })

    return Promise.all(promises)
      .then(() => {
        return {
          files: result
        }
      })
  }
}
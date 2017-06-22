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
    this.s3Client = s3.createClient(config.s3)
    this.config = config
  }

  singleFile(name = 'file') {
    return multer({dest: this.config.paths.temp}).single(name)
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

  private uploadFile(name: string, fields, bucket: string, file) {
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
        return this.sendToS3(file.path, filename, bucket)
          .then(() => record)
          .catch(error => this.fileCollection.remove(record)
            .then(() => {
              throw error
            }))
      })

  }

  upload(name: string, fields, bucket: string, request: Request) {
    const req = request.original
    return this.uploadFile(name, fields, bucket, req.file)
      .then(record => ({
        file: record
      }))
  }
}
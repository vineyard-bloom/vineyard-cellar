import {Request, BadRequest} from 'vineyard-lawn'
import {Collection} from "vineyard-ground"
import {CellarClient} from "./cellar-client";
const multer = require('multer')

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
  paths: PathConfig
  useMock: boolean
}

export class Cellar {
  private fileCollection: Collection<File>
  private client
  private config: CellarConfig

  constructor(fileCollection: Collection<File>, config: CellarConfig, client: CellarClient) {
    this.fileCollection = fileCollection
    this.config = config
    this.client = client
  }

  singleFile(name = 'file') {
    return multer({dest: this.config.paths.temp}).single(name)
  }

  getConfig(): CellarConfig {
    return this.config
  }

  createFile(name: string, fields, file) {
      const path = require('path')
      const ext = path.extname(file.originalname) || ''
      const filename = name + ext

      return Object.assign({
        filename: filename,
        path: file.path,
        extension: ext.substring(1),
        size: file.size,
      }, fields)
  }

  private uploadFile(name: string, fields, file) {
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
        return this.client.send(file.path, filename)
          .then(() => record)
          .catch(error => this.fileCollection.remove(record)
            .then(() => {
              throw error
            }))
      })
      

  }

  upload(name: string, fields, request: Request) {
    const req = request.original
    return this.uploadFile(name, fields, req.file)
      .then(record => ({
        file: record
      }))
  }
}

import {Request, BadRequest} from 'vineyard-lawn'
import {Collection} from "vineyard-ground"
import {CellarStorage} from "./types";
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
}

export class Cellar {
  private fileCollection: Collection<File>
  private storage:CellarStorage
  private config: CellarConfig

  constructor(fileCollection: Collection<File>, config: CellarConfig, storage: CellarStorage) {
    this.fileCollection = fileCollection
    this.config = config
    this.storage = storage
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

  private uploadFile(name: string, user, file) {
    const path = require('path')
    const ext = path.extname(file.originalname) || ''
    const filename = name + ext

    const entity = Object.assign({
      filename: filename,
      path: file.path,
      extension: ext.substring(1),
      size: file.size,
    }, {user: user.id})

    return this.fileCollection.create(entity)
      .then(record => {
        return this.storage.store(file.path, filename, user)
          .then(() => record)
          .catch(error => this.fileCollection.remove(record)
            .then(() => {
              throw error
            }))
      })
  }

  upload(name: string, user, request: Request) {
    const req = request.original
    if (!req.file) {
      console.error('upload-req-error', req)
      throw new Error("Upload request is missing file.")
    }

    return this.uploadFile(name, user, req.file)
  }

  private downloadFile(file) {
    return this.storage.retrieve(file.path, file.filename)
      .then(file => file)
      .catch(error => error)
  }

  download(file) {
    if (!file.path || !file.filename) {
      console.error('download-req-error', req)
      throw new Error('Download request is missing file.')
    }

    return this.downloadFile(file)
  }
}

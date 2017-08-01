"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multer = require('multer');
var s3 = require('s3');
function getFiles(files) {
    return Array.isArray(files)
        ? files
        : [files];
}
var Cellar = (function () {
    function Cellar(fileCollection, config) {
        this.fileCollection = fileCollection;
        this.s3Client = s3.createClient(config.s3);
        this.config = config;
    }
    Cellar.prototype.singleFile = function (name) {
        if (name === void 0) { name = 'file'; }
        return multer({ dest: this.config.paths.temp }).single(name);
    };
    Cellar.prototype.getConfig = function () {
        return this.config;
    };
    Cellar.prototype.sendToS3 = function (localPath, remotePath, bucket) {
        var _this = this;
        var params = {
            localFile: localPath,
            s3Params: {
                Bucket: bucket,
                Key: remotePath,
            },
        };
        return new Promise(function (resolve, reject) {
            var uploader = _this.s3Client.uploadFile(params);
            uploader.on('error', function (error) {
                reject(error);
            });
            uploader.on('end', function () {
                resolve();
            });
        });
    };
    Cellar.prototype.createFile = function (name, fields, file) {
        var path = require('path');
        var ext = path.extname(file.originalname) || '';
        var filename = name + ext;
        return Object.assign({
            filename: filename,
            path: file.path,
            extension: ext.substring(1),
            size: file.size,
        }, fields);
    };
    Cellar.prototype.uploadFile = function (name, fields, bucket, file) {
        var _this = this;
        var path = require('path');
        var ext = path.extname(file.originalname) || '';
        var filename = name + ext;
        var entity = Object.assign({
            filename: filename,
            path: file.path,
            extension: ext.substring(1),
            size: file.size,
        }, fields);
        // const entity = this.createFile(name, fields, file)
        return this.fileCollection.create(entity)
            .then(function (record) {
            return _this.sendToS3(file.path, filename, bucket)
                .then(function () { return record; })
                .catch(function (error) { return _this.fileCollection.remove(record)
                .then(function () {
                throw error;
            }); });
        });
    };
    Cellar.prototype.upload = function (name, fields, bucket, request) {
        var req = request.original;
        if (!req.file) {
            console.error('upload-req-error', req);
            throw new Error("Upload request is missing file.");
        }
        return this.uploadFile(name, fields, bucket, req.file)
            .then(function (record) { return ({
            file: record
        }); });
    };
    return Cellar;
}());
exports.Cellar = Cellar;
//# sourceMappingURL=cellar.js.map
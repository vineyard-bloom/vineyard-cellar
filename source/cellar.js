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
        this.s3Client = s3.createClient(config);
        this.config = config;
    }
    Cellar.prototype.integrate = function (app) {
        app.use(multer({ dest: this.config.paths.temp }));
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
    Cellar.prototype.upload = function (name, fields, bucket, request, req) {
        var _this = this;
        var files = getFiles(req.files);
        var result = [];
        var promises = files.map(function (file) {
            var path = require('path');
            var ext = path.extname(file.originalname) || '';
            var filename = name + ext;
            var entity = Object.assign({
                filename: filename,
                path: file.path,
                extension: ext.substring(1),
                size: file.size,
            }, fields);
            return _this.fileCollection.create(entity)
                .then(function (record) {
                result.push(record);
                return _this.sendToS3(file.path, filename, bucket);
            });
        });
        return Promise.all(promises)
            .then(function () {
            return {
                files: result
            };
        });
    };
    return Cellar;
}());
exports.Cellar = Cellar;
//# sourceMappingURL=cellar.js.map
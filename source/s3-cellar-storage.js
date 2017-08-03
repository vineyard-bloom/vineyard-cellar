"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3 = require('s3');
var S3CellarStorage = (function () {
    function S3CellarStorage(config) {
        this.config = config;
        this.client = s3.createClient(this.config.client);
    }
    S3CellarStorage.prototype.store = function (localPath, remotePath) {
        var _this = this;
        var params = {
            localFile: localPath,
            s3Params: {
                Bucket: this.config.defaultBucket,
                Key: remotePath,
            },
        };
        return new Promise(function (resolve, reject) {
            var uploader = _this.client.uploadFile(params);
            uploader.on('error', function (error) {
                reject(error);
            });
            uploader.on('end', function () {
                resolve();
            });
        });
    };
    return S3CellarStorage;
}());
exports.S3CellarStorage = S3CellarStorage;
//# sourceMappingURL=s3-cellar-storage.js.map
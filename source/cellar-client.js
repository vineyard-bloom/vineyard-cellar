"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var s3 = require('s3');
var S3CellarClient = (function () {
    function S3CellarClient(config) {
        this.config = config.s3;
        this.client = s3.createClient(this.config);
    }
    S3CellarClient.prototype.send = function (localPath, remotePath) {
        var _this = this;
        var params = {
            localFile: localPath,
            s3Params: {
                Bucket: this.config.bucket,
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
    return S3CellarClient;
}());
exports.S3CellarClient = S3CellarClient;
/**
 * Created by patrickmedaugh on 8/1/17.
 */
//# sourceMappingURL=cellar-client.js.map
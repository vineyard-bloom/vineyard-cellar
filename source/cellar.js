"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multer = require('multer');
function getFiles(files) {
    return Array.isArray(files)
        ? files
        : [files];
}
var Cellar = (function () {
    function Cellar(fileCollection, config, storage) {
        this.fileCollection = fileCollection;
        this.config = config;
        this.storage = storage;
    }
    Cellar.prototype.singleFile = function (name) {
        if (name === void 0) { name = 'file'; }
        return multer({ dest: this.config.paths.temp }).single(name);
    };
    Cellar.prototype.getConfig = function () {
        return this.config;
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
    Cellar.prototype.uploadFile = function (name, fields, file) {
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
        return this.fileCollection.create(entity)
            .then(function (record) {
            return _this.storage.store(file.path, filename)
                .then(function () { return record; })
                .catch(function (error) { return _this.fileCollection.remove(record)
                .then(function () {
                throw error;
            }); });
        });
    };
    Cellar.prototype.upload = function (name, fields, request) {
        var req = request.original;
        if (!req.file) {
            console.error('upload-req-error', req);
            throw new Error("Upload request is missing file.");
        }
        return this.uploadFile(name, fields, req.file);
    };
    return Cellar;
}());
exports.Cellar = Cellar;
//# sourceMappingURL=cellar.js.map
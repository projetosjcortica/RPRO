var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "typeorm"], function (require, exports, typeorm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CacheFile = void 0;
    let CacheFile = class CacheFile {
    };
    exports.CacheFile = CacheFile;
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], CacheFile.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
        __metadata("design:type", String)
    ], CacheFile.prototype, "originalName", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastHash", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastSize", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastMTime", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastRowDia", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 16, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastRowHora", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 40, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastRowTimestamp", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastRowCount", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 40, nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "lastProcessedAt", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], CacheFile.prototype, "ingestedRows", void 0);
    exports.CacheFile = CacheFile = __decorate([
        (0, typeorm_1.Entity)({ name: 'cache_file' })
    ], CacheFile);
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "typeorm", "./Batch"], function (require, exports, typeorm_1, Batch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Row = void 0;
    let Row = class Row {
    };
    exports.Row = Row;
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], Row.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(() => Batch_1.Batch, (b) => b.rows),
        __metadata("design:type", Batch_1.Batch)
    ], Row.prototype, "batch", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
        __metadata("design:type", Object)
    ], Row.prototype, "datetime", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
        __metadata("design:type", Object)
    ], Row.prototype, "Nome", void 0);
    __decorate([
        (0, typeorm_1.Column)({ name: 'Código Fórmula', type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Row.prototype, "Form1", void 0);
    __decorate([
        (0, typeorm_1.Column)({ name: 'Número Fórmula', type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Row.prototype, "Form2", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
        __metadata("design:type", Object)
    ], Row.prototype, "values", void 0);
    exports.Row = Row = __decorate([
        (0, typeorm_1.Entity)()
    ], Row);
});

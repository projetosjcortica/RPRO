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
    exports.MateriaPrima = void 0;
    let MateriaPrima = class MateriaPrima {
    };
    exports.MateriaPrima = MateriaPrima;
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], MateriaPrima.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', unique: true }),
        __metadata("design:type", Number)
    ], MateriaPrima.prototype, "num", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
        __metadata("design:type", String)
    ], MateriaPrima.prototype, "produto", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int' }),
        __metadata("design:type", Number)
    ], MateriaPrima.prototype, "medida", void 0);
    exports.MateriaPrima = MateriaPrima = __decorate([
        (0, typeorm_1.Entity)({ name: 'materia_prima' })
    ], MateriaPrima);
});

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
    exports.Relatorio = void 0;
    let Relatorio = class Relatorio {
    };
    exports.Relatorio = Relatorio;
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
        __metadata("design:type", String)
    ], Relatorio.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Dia", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'time', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Hora", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Nome", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Form1", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Form2", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_1", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_2", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_3", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_4", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_5", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_6", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_7", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_8", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_9", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_10", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_11", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_12", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_13", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_14", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_15", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_16", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_17", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_18", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_19", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_20", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_21", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_22", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_23", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_24", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_25", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_26", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_27", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_28", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_29", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_30", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_31", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_32", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_33", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_34", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_35", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_36", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_37", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_38", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_39", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'int', nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Prod_40", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_1", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_2", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_3", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_4", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_5", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_6", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_7", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_8", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_9", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_10", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_11", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_12", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_13", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_14", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_15", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_16", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_17", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_18", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_19", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_20", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_21", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_22", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_23", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_24", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_25", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_26", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_27", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_28", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_29", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_30", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_31", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_32", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_33", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_34", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_35", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_36", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_37", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_38", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_39", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 2, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Unidade_40", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "processedFile", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "Area", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
        __metadata("design:type", Object)
    ], Relatorio.prototype, "AreaDescricao", void 0);
    exports.Relatorio = Relatorio = __decorate([
        (0, typeorm_1.Entity)({ name: 'relatorio' })
    ], Relatorio);
});

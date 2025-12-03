"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estoque = void 0;
const typeorm_1 = require("typeorm");
const MateriaPrima_1 = require("./MateriaPrima");
/**
 * Entidade para gerenciamento de estoque de matérias-primas.
 * Armazena informações sobre quantidade disponível, mínima e máxima.
 */
let Estoque = class Estoque {
};
exports.Estoque = Estoque;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Estoque.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MateriaPrima_1.MateriaPrima),
    (0, typeorm_1.JoinColumn)({ name: 'materia_prima_id' }),
    __metadata("design:type", MateriaPrima_1.MateriaPrima)
], Estoque.prototype, "materiaPrima", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Estoque.prototype, "materia_prima_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Estoque.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Estoque.prototype, "quantidade_minima", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3, default: 0 }),
    __metadata("design:type", Number)
], Estoque.prototype, "quantidade_maxima", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'kg' }),
    __metadata("design:type", String)
], Estoque.prototype, "unidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Estoque.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Estoque.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Estoque.prototype, "localizacao", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Estoque.prototype, "criado_em", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Estoque.prototype, "atualizado_em", void 0);
exports.Estoque = Estoque = __decorate([
    (0, typeorm_1.Entity)({ name: 'estoque' })
], Estoque);
//# sourceMappingURL=Estoque.js.map
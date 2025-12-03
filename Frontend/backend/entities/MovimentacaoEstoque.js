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
exports.MovimentacaoEstoque = exports.TipoMovimentacao = void 0;
const typeorm_1 = require("typeorm");
const MateriaPrima_1 = require("./MateriaPrima");
/**
 * Tipos de movimentação de estoque
 */
var TipoMovimentacao;
(function (TipoMovimentacao) {
    TipoMovimentacao["ENTRADA"] = "entrada";
    TipoMovimentacao["SAIDA"] = "saida";
    TipoMovimentacao["AJUSTE"] = "ajuste";
    TipoMovimentacao["INVENTARIO"] = "inventario";
})(TipoMovimentacao || (exports.TipoMovimentacao = TipoMovimentacao = {}));
/**
 * Entidade para registro de movimentações de estoque.
 * Registra entradas, saídas e ajustes de inventário.
 */
let MovimentacaoEstoque = class MovimentacaoEstoque {
};
exports.MovimentacaoEstoque = MovimentacaoEstoque;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MateriaPrima_1.MateriaPrima),
    (0, typeorm_1.JoinColumn)({ name: 'materia_prima_id' }),
    __metadata("design:type", MateriaPrima_1.MateriaPrima)
], MovimentacaoEstoque.prototype, "materiaPrima", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "materia_prima_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: TipoMovimentacao.ENTRADA }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], MovimentacaoEstoque.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], MovimentacaoEstoque.prototype, "quantidade_anterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], MovimentacaoEstoque.prototype, "quantidade_atual", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'kg' }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "unidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "documento_referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "responsavel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MovimentacaoEstoque.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MovimentacaoEstoque.prototype, "data_movimentacao", void 0);
exports.MovimentacaoEstoque = MovimentacaoEstoque = __decorate([
    (0, typeorm_1.Entity)({ name: 'movimentacao_estoque' })
], MovimentacaoEstoque);
//# sourceMappingURL=MovimentacaoEstoque.js.map
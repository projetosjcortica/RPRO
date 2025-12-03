"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.materiaPrimaService = exports.MateriaPrimaService = void 0;
const baseService_1 = require("../core/baseService");
const MateriaPrima_1 = require("../entities/MateriaPrima");
const dbService_1 = require("./dbService");
const typeorm_1 = require("typeorm");
class MateriaPrimaService extends baseService_1.BaseService {
    constructor() {
        super('MateriaPrimaService');
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield dbService_1.dbService.init();
            const repo = dbService_1.AppDataSource.getRepository(MateriaPrima_1.MateriaPrima);
            return repo.find({
                order: {
                    num: 'ASC'
                }
            });
        });
    }
    saveMany(items) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dbService_1.dbService.init();
            const repo = dbService_1.AppDataSource.getRepository(MateriaPrima_1.MateriaPrima);
            // Processar cada item antes de salvar
            const processedItems = items.map(item => {
                const _a = item, { categoria } = _a, rest = __rest(_a, ["categoria"]);
                const medida = item.medida === 0 ? 0 : 1;
                // Coerce num to number when possible
                if (rest.num !== undefined && rest.num !== null)
                    rest.num = Number(rest.num);
                return Object.assign(Object.assign({}, rest), { medida });
            });
            // Deduplicate incoming items by `num` (keep last occurrence) to avoid attempting
            // multiple inserts with the same unique `num` in a single save operation.
            const dedupMap = new Map();
            for (const p of processedItems) {
                const n = p.num !== undefined && p.num !== null ? Number(p.num) : NaN;
                if (!Number.isFinite(n))
                    continue;
                dedupMap.set(n, p);
            }
            const dedupedItems = Array.from(dedupMap.values());
            // Collect numeric nums to check existing records and avoid duplicate unique-key errors
            const nums = dedupedItems.map(p => Number(p.num)).filter(n => Number.isFinite(n));
            const existing = nums.length > 0 ? yield repo.find({ where: { num: (0, typeorm_1.In)(nums) } }) : [];
            const existingByNum = new Map();
            for (const e of existing)
                existingByNum.set(e.num, e);
            const toSave = [];
            for (const p of dedupedItems) {
                const n = p.num !== undefined && p.num !== null ? Number(p.num) : NaN;
                if (!Number.isFinite(n)) {
                    console.warn('[MateriaPrimaService] skipping item with invalid num', p);
                    continue;
                }
                if (existingByNum.has(n)) {
                    // merge into existing record (will perform update because id is present)
                    const existingRec = existingByNum.get(n);
                    toSave.push(Object.assign(Object.assign({}, existingRec), p));
                }
                else {
                    toSave.push(p);
                }
            }
            try {
                return yield repo.save(toSave);
            }
            catch (err) {
                console.error('[MateriaPrimaService] failed to save items', err);
                throw err;
            }
        });
    }
    /**
     * Converte um valor com base na unidade de medida da matéria prima
     * @param valorOriginal O valor original
     * @param materia A matéria prima com informação de medida
     * @returns O valor convertido
     */
    convertValue(valorOriginal, materia) {
        // Se for gramas (medida = 0), divide por 1000 para converter para kg
        if (materia.medida === 0) {
            return valorOriginal / 1000;
        }
        // Se já estiver em kg, retorna o valor original
        return valorOriginal;
    }
    /**
     * Obtém a unidade de medida como string
     * @param materia A matéria prima
     * @returns A unidade de medida (g ou kg)
     */
    getUnidade(materia) {
        return materia.medida === 0 ? 'g' : 'kg';
    }
}
exports.MateriaPrimaService = MateriaPrimaService;
exports.materiaPrimaService = new MateriaPrimaService();
//# sourceMappingURL=materiaPrimaService.js.map
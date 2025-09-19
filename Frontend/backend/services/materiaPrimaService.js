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
define(["require", "exports", "../core/baseService", "../entities/MateriaPrima", "./dbService"], function (require, exports, baseService_1, MateriaPrima_1, dbService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.materiaPrimaService = exports.MateriaPrimaService = void 0;
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
                    // Remover a categoria se estiver definida
                    const _a = item, { categoria } = _a, rest = __rest(_a, ["categoria"]);
                    // Garantir que o valor de medida seja apenas 0 (gramas) ou 1 (kg)
                    const medida = item.medida === 0 ? 0 : 1;
                    return Object.assign(Object.assign({}, rest), { medida });
                });
                return repo.save(processedItems);
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
});

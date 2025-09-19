define(["require", "exports", "../core/baseService"], function (require, exports, baseService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unidadesService = exports.UnidadesService = void 0;
    class UnidadesService extends baseService_1.BaseService {
        constructor() {
            super('UnidadesService');
        }
        /**
         * Converte valores entre unidades de massa
         * @param valor Valor a ser convertido
         * @param de Unidade de origem (0 = g, 1 = kg)
         * @param para Unidade de destino (0 = g, 1 = kg)
         * @returns Valor convertido
         */
        converterUnidades(valor, de, para) {
            // Se as unidades forem iguais, não precisa converter
            if (de === para)
                return valor;
            // Converter de g para kg (divide por 1000)
            if (de === 0 && para === 1) {
                return valor / 1000;
            }
            // Converter de kg para g (multiplica por 1000)
            if (de === 1 && para === 0) {
                return valor * 1000;
            }
            // Se chegou aqui, algo está errado
            throw new Error(`Conversão inválida: de ${de} para ${para}`);
        }
        /**
         * Normaliza todos os valores para kg (unidade padrão do sistema)
         * @param valores Objeto com valores por coluna
         * @param unidades Objeto com unidades por coluna (0 = g, 1 = kg)
         * @returns Objeto com valores normalizados em kg
         */
        normalizarParaKg(valores, unidades) {
            const resultado = {};
            for (const coluna in valores) {
                if (valores.hasOwnProperty(coluna) && unidades.hasOwnProperty(coluna)) {
                    const valor = valores[coluna];
                    const unidade = unidades[coluna];
                    // Se for em gramas, converte para kg
                    if (unidade === 0) {
                        resultado[coluna] = valor / 1000;
                    }
                    else {
                        resultado[coluna] = valor;
                    }
                }
                else {
                    // Mantém o valor original se não houver informação de unidade
                    resultado[coluna] = valores[coluna];
                }
            }
            return resultado;
        }
    }
    exports.UnidadesService = UnidadesService;
    exports.unidadesService = new UnidadesService();
});

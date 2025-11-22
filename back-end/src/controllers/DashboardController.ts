import { Request, Response } from 'express';
import { AppDataSource } from '../services/dbService';
import { Relatorio, MateriaPrima } from '../entities';
import { materiaPrimaService } from '../services/materiaPrimaService';
import { resumoService } from '../services/resumoService';
import { getCollectorStatus } from '../index'; // We'll need to export this or move it
import { getRuntimeConfig } from '../core/runtimeConfig';
import path from 'path';
import fs from 'fs';

export class DashboardController {
    static async getDashboardData(req: Request, res: Response) {
        try {
            const startTime = Date.now();

            // Extract filters from request
            const {
                dataInicio,
                dataFim,
                nomeFormula,
                codigo,
                numero,
                areaId
            } = req.query;

            const advancedFilters = req.body?.advancedFilters || {};

            // 1. Run independent queries in parallel
            const [
                materias,
                formulasLabels,
                resumoData,
                collectorStatus,
                reportLogo,
                ihmConfig
            ] = await Promise.all([
                // A. Materias Primas (Labels & Active Status)
                materiaPrimaService.getAll(),

                // B. Formula Labels
                DashboardController.getFormulaLabels(),

                // C. Resumo Data (The heavy lifter)
                resumoService.getResumo({
                    areaId: areaId as string,
                    formulaName: nomeFormula as string,
                    dateStart: dataInicio as string,
                    dateEnd: dataFim as string,
                    codigo: codigo ? Number(codigo) : undefined,
                    numero: numero ? Number(numero) : undefined
                }, advancedFilters),

                // D. Collector Status
                Promise.resolve(getCollectorStatus()),

                // E. Report Logo Path
                DashboardController.getReportLogo(),

                // F. IHM Config (Safe version)
                DashboardController.getSafeIhmConfig(req)
            ]);

            // Process Materias Primas for Frontend
            const productsMap: Record<string, any> = {};
            const colOffset = 5;
            for (const m of materias) {
                if (!m || typeof m.num !== 'number') continue;
                const colKey = `col${m.num + colOffset}`;
                productsMap[colKey] = {
                    nome: m.produto ?? `Produto ${m.num}`,
                    unidade: Number(m.medida) === 0 ? 'g' : 'kg',
                    num: m.num,
                    ativo: m.ativo ?? true
                };
            }

            const response = {
                meta: {
                    timestamp: new Date().toISOString(),
                    durationMs: Date.now() - startTime
                },
                data: {
                    products: productsMap,
                    formulas: formulasLabels,
                    resumo: resumoData,
                    collector: collectorStatus,
                    config: {
                        logoUrl: reportLogo,
                        ihm: ihmConfig
                    }
                }
            };

            return res.json(response);

        } catch (error: any) {
            console.error('[DashboardController] Error:', error);
            return res.status(500).json({
                error: error.message || 'Internal Server Error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    private static async getFormulaLabels() {
        const repo = AppDataSource.getRepository(Relatorio);
        const raw = await repo
            .createQueryBuilder('r')
            .select(['r.Form1 as codigo', 'r.Nome as nome'])
            .groupBy('r.Form1, r.Nome')
            .orderBy('r.Form1')
            .getRawMany();

        const map: Record<string, string> = {};
        for (const row of raw) {
            if (row.codigo != null) {
                map[String(row.codigo)] = row.nome || `Formula ${row.codigo}`;
            }
        }
        return map;
    }

    private static async getReportLogo() {
        try {
            const config = getRuntimeConfig('report-config') || {};
            return config.logoPath || null;
        } catch {
            return null;
        }
    }

    private static async getSafeIhmConfig(req: Request) {
        try {
            // Check user type/module from request if needed, or just return generic
            const config = getRuntimeConfig('ihm-config') || {};
            // Return only safe fields
            return {
                ip: config.ip || '',
                user: config.user || '',
                // Do not return password
                connected: false // Placeholder, real status is in collectorStatus
            };
        } catch {
            return null;
        }
    }
}

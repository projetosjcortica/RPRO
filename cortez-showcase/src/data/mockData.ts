/**
 * Mock Data Generator for Cortez Showcase
 * Generates realistic test data for all component demonstrations
 */

// Product names (40 realistic products)
export const PRODUCT_NAMES = [
    'Farinha de Trigo', 'Açúcar Refinado', 'Óleo de Soja', 'Sal Refinado',
    'Fermento Biológico', 'Leite em Pó', 'Ovos', 'Manteiga',
    'Chocolate em Pó', 'Cacau em Pó', 'Baunilha', 'Canela',
    'Amido de Milho', 'Polvilho Doce', 'Polvilho Azedo', 'Fubá',
    'Aveia em Flocos', 'Linhaça', 'Gergelim', 'Amendoim Torrado',
    'Castanha de Caju', 'Nozes', 'Amêndoas', 'Coco Ralado',
    'Passas', 'Frutas Cristalizadas', 'Goiabada', 'Doce de Leite',
    'Mel', 'Glucose', 'Essência de Baunilha', 'Corante Vermelho',
    'Corante Amarelo', 'Bicarbonato', 'Creme de Leite', 'Leite Condensado',
    'Queijo Ralado', 'Requeijão', 'Presunto', 'Bacon'
];

// Formula names
export const FORMULA_NAMES = [
    'Pão Francês',
    'Pão de Forma',
    'Bolo de Chocolate',
    'Bolo de Cenoura',
    'Biscoito de Polvilho',
    'Biscoito de Aveia',
    'Torta de Frango',
    'Torta de Palmito',
    'Empada de Frango',
    'Sonho Recheado'
];

/**
 * Generate random date within range
 */
export function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random number within range
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float within range
 */
export function randomFloat(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

/**
 * Generate products data
 */
export function generateProducts() {
    return PRODUCT_NAMES.map((name, index) => ({
        id: index + 1,
        num: index + 1,
        name,
        produto: name,
        category: getCategoryForProduct(name),
        unit: getUnitForProduct(name),
        stock: randomFloat(0, 1000, 3),
        minStock: randomFloat(10, 100, 3),
        maxStock: randomFloat(500, 2000, 3),
        ativo: Math.random() > 0.1, // 90% active
        medida: getUnitCodeForProduct(name)
    }));
}

/**
 * Generate formulas data
 */
export function generateFormulas() {
    return FORMULA_NAMES.map((name, index) => ({
        id: index + 1,
        name,
        description: `Receita tradicional de ${name}`,
        products: generateFormulaProducts(),
        category: getCategoryForFormula(name),
        yield: randomFloat(5, 50, 2)
    }));
}

/**
 * Generate production records (1000+ records over 3 months)
 */
export function generateProductionRecords(count: number = 1000) {
    const records = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    for (let i = 0; i < count; i++) {
        const date = randomDate(startDate, endDate);
        const hour = randomInt(8, 18); // Business hours
        const formulaId = randomInt(1, FORMULA_NAMES.length);
        const productId = randomInt(1, PRODUCT_NAMES.length);

        records.push({
            id: i + 1,
            date: date.toISOString().split('T')[0],
            Dia: date.toISOString().split('T')[0],
            hour: `${hour.toString().padStart(2, '0')}:00`,
            Hora: `${hour.toString().padStart(2, '0')}:00`,
            formulaId,
            formula: FORMULA_NAMES[formulaId - 1],
            Nome: FORMULA_NAMES[formulaId - 1],
            productId,
            product: PRODUCT_NAMES[productId - 1],
            quantity: randomFloat(1, 100, 3),
            batchCode: `LOTE-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${randomInt(1000, 9999)}`
        });
    }

    return records;
}

/**
 * Generate amendoim (peanut) records
 */
export function generateAmendoimRecords(count: number = 500) {
    const records = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);

    for (let i = 0; i < count; i++) {
        const date = randomDate(startDate, endDate);
        const hour = randomInt(8, 18);
        const type = Math.random() > 0.5 ? 'entrada' : 'saida';
        const weightIn = randomFloat(500, 2000, 2);
        const weightOut = type === 'saida' ? weightIn * randomFloat(0.7, 0.9, 2) : 0;

        records.push({
            id: i + 1,
            date: date.toISOString().split('T')[0],
            hour: `${hour.toString().padStart(2, '0')}:00`,
            type,
            weightIn,
            weightOut,
            yieldPercent: type === 'saida' ? (weightOut / weightIn) * 100 : null,
            balanca: randomInt(1, 3),
            operator: `Operador ${randomInt(1, 5)}`
        });
    }

    return records;
}

// Helper functions
function getCategoryForProduct(name: string): string {
    if (name.includes('Farinha') || name.includes('Fubá') || name.includes('Polvilho')) return 'Farinhas';
    if (name.includes('Açúcar') || name.includes('Mel') || name.includes('Glucose')) return 'Açúcares';
    if (name.includes('Óleo') || name.includes('Manteiga')) return 'Gorduras';
    if (name.includes('Leite') || name.includes('Queijo') || name.includes('Requeijão')) return 'Laticínios';
    if (name.includes('Chocolate') || name.includes('Cacau')) return 'Chocolates';
    if (name.includes('Castanha') || name.includes('Amendoim') || name.includes('Nozes')) return 'Oleaginosas';
    if (name.includes('Corante') || name.includes('Essência')) return 'Aditivos';
    return 'Outros';
}

function getUnitForProduct(name: string): string {
    if (name.includes('Ovos')) return 'unidade';
    return 'kg';
}

function getUnitCodeForProduct(name: string): number {
    if (name.includes('Ovos')) return 2; // unidade
    return 1; // kg
}

function getCategoryForFormula(name: string): string {
    if (name.includes('Pão')) return 'Panificação';
    if (name.includes('Bolo')) return 'Confeitaria';
    if (name.includes('Biscoito')) return 'Biscoitos';
    if (name.includes('Torta') || name.includes('Empada')) return 'Salgados';
    return 'Outros';
}

function generateFormulaProducts() {
    const count = randomInt(3, 8);
    const products = [];
    const usedProducts = new Set();

    for (let i = 0; i < count; i++) {
        let productId;
        do {
            productId = randomInt(1, PRODUCT_NAMES.length);
        } while (usedProducts.has(productId));

        usedProducts.add(productId);
        products.push({
            productId,
            productName: PRODUCT_NAMES[productId - 1],
            quantity: randomFloat(0.1, 10, 3)
        });
    }

    return products;
}

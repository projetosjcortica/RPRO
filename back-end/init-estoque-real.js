/**
 * Script para inicializar o estoque baseado nos dados reais de produção
 */

const BASE_URL = 'http://localhost:3000';

async function inicializarEstoqueReal() {
  console.log('🔄 Inicializando estoque com dados reais...\n');

  try {
    // 1. Buscar todas as matérias-primas cadastradas
    console.log('1️⃣ Buscando matérias-primas cadastradas...');
    const mpRes = await fetch(`${BASE_URL}/api/db/getMateriaPrima`);
    const materiasPrimas = await mpRes.json();
    console.log(`✅ ${materiasPrimas.length} matérias-primas encontradas`);

    // 2. Buscar dados de produção para calcular consumo
    console.log('\n2️⃣ Analisando dados de produção...');
    const rowsRes = await fetch(`${BASE_URL}/api/relatorio/paginate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: { page: 1, pageSize: 1000 } })
    });
    const rowsData = await rowsRes.json();
    console.log(`✅ ${rowsData.rows.length} batidas de produção encontradas`);

    // 3. Calcular consumo médio por matéria-prima
    const consumoPorMateria = new Map();
    
    for (const row of rowsData.rows) {
      if (!row.values) continue;
      
      for (let i = 0; i < row.values.length; i++) {
        const quantidade = row.values[i];
        if (quantidade && quantidade > 0) {
          if (!consumoPorMateria.has(i)) {
            consumoPorMateria.set(i, { total: 0, batidas: 0 });
          }
          const stats = consumoPorMateria.get(i);
          stats.total += quantidade;
          stats.batidas++;
        }
      }
    }

    console.log(`✅ ${consumoPorMateria.size} matérias-primas com consumo registrado`);

    // 4. Inicializar estoque para cada matéria-prima com dados reais
    console.log('\n3️⃣ Inicializando estoque...');
    let inicializados = 0;
    
    for (const mp of materiasPrimas) {
      const consumo = consumoPorMateria.get(mp.num);
      
      if (consumo) {
        const mediaPorBatida = consumo.total / consumo.batidas;
        
        // Estoque inicial: suficiente para 60 dias de produção
        // Assumindo 50 batidas/dia em média
        const quantidadeInicial = Math.round(mediaPorBatida * 50 * 60);
        
        // Mínimo: 7 dias de produção
        const minimo = Math.round(mediaPorBatida * 50 * 7);
        
        // Máximo: 90 dias de produção
        const maximo = Math.round(mediaPorBatida * 50 * 90);

        try {
          const initRes = await fetch(`${BASE_URL}/api/estoque/inicializar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              materiaPrimaId: mp.id,
              quantidadeInicial,
              minimo,
              maximo
            })
          });

          if (initRes.ok) {
            inicializados++;
            const produtoNome = mp.produto || `MP${mp.num}`;
            console.log(`   ✅ ${produtoNome}: ${quantidadeInicial}kg (min: ${minimo}, max: ${maximo})`);
          }
        } catch (err) {
          console.log(`   ⚠️ Erro ao inicializar ${mp.produto || mp.num}: ${err.message}`);
        }
      } else {
        // Para matérias sem consumo, inicializar com valores padrão baixos
        try {
          const initRes = await fetch(`${BASE_URL}/api/estoque/inicializar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              materiaPrimaId: mp.id,
              quantidadeInicial: 1000,
              minimo: 100,
              maximo: 5000
            })
          });

          if (initRes.ok) {
            inicializados++;
            console.log(`   ℹ️ ${mp.produto || `MP${mp.num}`}: 1000kg (sem histórico de consumo)`);
          }
        } catch (err) {
          console.log(`   ⚠️ Erro ao inicializar ${mp.produto || mp.num}: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ ${inicializados} estoques inicializados com sucesso!`);

    // 5. Registrar algumas movimentações de exemplo
    console.log('\n4️⃣ Registrando movimentações de exemplo...');
    
    const mpComConsumo = Array.from(consumoPorMateria.keys()).slice(0, 5);
    for (const numMateria of mpComConsumo) {
      const mp = materiasPrimas.find(m => m.num === numMateria);
      if (!mp) continue;

      // Entrada
      await fetch(`${BASE_URL}/api/estoque/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materiaPrimaId: mp.id,
          quantidade: 5000,
          responsavel: 'Sistema',
          observacoes: 'Entrada inicial automática'
        })
      });

      // Saída
      await fetch(`${BASE_URL}/api/estoque/saida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materiaPrimaId: mp.id,
          quantidade: 1500,
          responsavel: 'Sistema',
          observacoes: 'Consumo produção automático'
        })
      });

      console.log(`   ✅ Movimentações criadas para ${mp.produto || `MP${mp.num}`}`);
    }

    // 6. Verificar estatísticas finais
    console.log('\n5️⃣ Verificando estatísticas...');
    const estatRes = await fetch(`${BASE_URL}/api/estoque/estatisticas`);
    const estatisticas = await estatRes.json();
    
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log(`   Total de itens: ${estatisticas.totalItens}`);
    console.log(`   Itens abaixo do mínimo: ${estatisticas.itensAbaixoMinimo}`);
    console.log(`   Itens acima do máximo: ${estatisticas.itensAcimaMaximo}`);
    console.log(`   Taxa de rotação: ${estatisticas.taxaRotacao.toFixed(2)}x`);

    console.log('\n✅ Inicialização concluída com sucesso!');
    console.log('\n📊 Acesse: http://localhost:5173/estoque-management');

  } catch (error) {
    console.error('\n❌ Erro durante a inicialização:', error.message);
    console.error('\n💡 Certifique-se de que o backend está rodando: npm run dev');
  }
}

// Executar
inicializarEstoqueReal();

/**
 * Script de teste para verificar as rotas de estoque
 * Execute: node test-estoque-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testarRotas() {
  console.log('🧪 Testando rotas de estoque...\n');

  try {
    // 1. Verificar servidor
    console.log('1️⃣ Verificando servidor...');
    const pingRes = await fetch(`${BASE_URL}/api/ping`);
    const pingData = await pingRes.json();
    console.log('✅ Servidor respondendo:', pingData);

    // 2. Listar estoque atual
    console.log('\n2️⃣ Listando estoque atual...');
    const estoqueRes = await fetch(`${BASE_URL}/api/estoque`);
    const estoqueData = await estoqueRes.json();
    console.log(`✅ ${estoqueData.length} itens em estoque`);

    // 3. Gerar dados de exemplo (se estoque vazio)
    if (estoqueData.length === 0) {
      console.log('\n3️⃣ Estoque vazio. Gerando dados de exemplo...');
      const exemploRes = await fetch(`${BASE_URL}/api/estoque/gerar-dados-exemplo`, {
        method: 'POST'
      });
      const exemploData = await exemploRes.json();
      console.log('✅ Dados de exemplo gerados:', exemploData);
      
      // Recarregar estoque
      const novoEstoqueRes = await fetch(`${BASE_URL}/api/estoque`);
      const novoEstoqueData = await novoEstoqueRes.json();
      console.log(`✅ ${novoEstoqueData.length} itens agora disponíveis`);
    }

    // 4. Buscar estatísticas
    console.log('\n4️⃣ Buscando estatísticas...');
    const estatRes = await fetch(`${BASE_URL}/api/estoque/estatisticas`);
    const estatData = await estatRes.json();
    console.log('✅ Estatísticas:', estatData);

    // 5. Buscar projeções
    console.log('\n5️⃣ Buscando projeções de estoque...');
    const projecaoRes = await fetch(`${BASE_URL}/api/estoque/projecao?dias=30`);
    const projecaoData = await projecaoRes.json();
    console.log(`✅ ${projecaoData.length} projeções calculadas`);
    if (projecaoData.length > 0) {
      console.log('   Exemplo:', projecaoData[0]);
    }

    // 6. Buscar consumo
    console.log('\n6️⃣ Calculando consumo de matérias-primas...');
    const consumoRes = await fetch(`${BASE_URL}/api/estoque/consumo`);
    const consumoData = await consumoRes.json();
    console.log(`✅ ${consumoData.length} itens com consumo calculado`);
    if (consumoData.length > 0) {
      console.log('   Exemplo:', consumoData[0]);
    }

    // 7. Listar movimentações
    console.log('\n7️⃣ Listando movimentações...');
    const movRes = await fetch(`${BASE_URL}/api/estoque/movimentacoes`);
    const movData = await movRes.json();
    console.log(`✅ ${movData.length} movimentações registradas`);

    console.log('\n✅ Todos os testes concluídos com sucesso!');
    console.log('\n📊 Acesse o frontend em: http://localhost:5173/estoque-management');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
    console.error('\n💡 Certifique-se de que o backend está rodando: npm run dev');
  }
}

// Executar testes
testarRotas();

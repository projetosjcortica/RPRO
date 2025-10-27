# RPRO — Plataforma de Gestão de Produção para a Indústria de Cortiça

## Resumo Executivo
O RPRO é uma plataforma completa para gestão de produção, desenhada para a indústria de cortiça. Conecta-se às suas IHMs, coleta dados automaticamente, organiza informações de lotes e fórmulas, e entrega relatórios claros em PDF/Excel para tomada de decisão rápida e segura.

— Menos planilhas e retrabalho.  
— Mais visibilidade do processo, rastreabilidade e confiança nos números.  
— Implantação simples, com migração do legado e integração direta ao chão de fábrica.


## Para quem é
- Fábricas e unidades de produção de cortiça.  
- Gestores de produção, qualidade e logística.  
- Equipes de PCP, suprimentos e diretoria que precisam de dados confiáveis para decidir.


## Problemas que resolvemos
- Coleta manual e dispersa de dados de produção (IHM → papel → Excel).  
- Falta de rastreabilidade de lotes e fórmulas ao longo do processo.
- Relatórios lentos, inconsistentes e pouco confiáveis para auditorias.  
- Dores na migração de dados antigos para um sistema único.


## O que o RPRO entrega
- Coleta automática: integra-se à IHM/FTP e importa CSVs de forma contínua.  
- Consolidação da produção: organiza relatórios por dia, lote, produto e fórmula.
- Relatórios prontos: exportações em PDF e Excel, com gráficos e resumos claros.  
- Migração facilitada: importa dumps SQL legados (datas DD/MM/YY), sanitiza e converte para o formato atual.  
- Operação local: aplicação desktop (Electron) com desempenho e estabilidade no ambiente fabril.


## Principais benefícios
- Confiabilidade dos dados: menos erro humano e mais padronização.  
- Agilidade na gestão: relatórios prontos em segundos, não horas.  
- Rastreabilidade ponta a ponta: lote, fórmula, consumo e resultado por período.  
- Visibilidade executiva: indicadores e gráficos que mostram o essencial.  
- Conformidade e auditoria: histórico exportável e controles consistentes.  
- Implantação sem traumas: importação do legado e adaptação ao seu fluxo atual.


## Diferenciais
- Feito para a indústria de cortiça: modelos, termos e fluxos pensados no seu dia a dia.  
- Flexível no chão de fábrica: lê CSVs do seu processo e respeita o que já funciona.  
- Exportações profissionais: PDF com identidade visual da sua empresa e Excel para análises.  
- Compatibilidade de banco: SQLite por padrão e opção de MySQL quando necessário.  
- Segurança operacional: sanificação de dumps, proteção de schema e integridade de dados.  
- Evolução contínua: arquitetura moderna, testes e documentação disponíveis.


## Como funciona (alto nível)
1) Coleta  
O RPRO monitora a pasta/FTP da IHM, baixa novos CSVs e salva um backup seguro.  

2) Processamento  
Os arquivos são analisados, validados e gravados em entidades estruturadas (Relatórios, Lotes, Matérias-Primas).  

3) Consolidação  
Os dados são agregados por período, produto e fórmula, gerando visões úteis e consistentes.  

4) Entrega  
Relatórios ficam disponíveis para exportação em PDF/Excel, com sumários e gráficos.


## Funcionalidades em destaque
- Relatórios de Produção  
  - Paginação e filtros por período e fórmula.  
  - Resumos visuais e gráficos com cores legíveis.  
  - Opção de ocultar comentários/gráficos no PDF.

- Exportação (PDF/Excel)  
  - PDF com visual pré-visualizado e logo da sua empresa.  
  - Excel pronto para compartilhamento e análise.

- Administração  
  - Importar dump SQL (legado ou moderno), com conversão automática de datas.  
  - Exportar dump SQL do banco atual (backup/migração).  
  - Resetar sistema (limpa produção, preserva usuários e configurações).  
  - Configurações de IHM, credenciais e pastas.


## Integrações e dados
- Entrada: CSVs gerados por IHMs (via pasta/FTP).  
- Saída: arquivos PDF e Excel; dump SQL para backup/migração.  
- Banco: SQLite/arquivo por padrão; MySQL quando necessário.


## Segurança e confiabilidade
- Importação com sanificação de SQL (remoção de comandos perigosos e compatibilização).  
- Proteções para chaves estrangeiras durante limpeza/importe.  
- Backups automáticos dos CSVs recebidos.  
- Logs completos para suporte e auditoria.


## Implantação
- Diagnóstico rápido do fluxo atual (IHM/arquivos).  
- Parametrização de diretórios e credenciais.  
- Importação do legado (quando aplicável).  
- Treinamento objetivo para operação diária (produção/PCP/qualidade).  
- Acompanhamento inicial para garantia de aderência.


## O que muda para sua equipe
- Operação: menos digitação manual, mais conferência e validação.  
- Gestão: relatórios confiáveis na hora da reunião (sem “gambiarras”).  
- Qualidade: melhor rastreabilidade de lotes e insumos.  
- Direção: visão consolidada e comparável entre períodos.


## Casos de uso (exemplos comuns)
- Consolidar a produção mensal com rastreabilidade de fórmulas por lote.  
- Preparar relatórios padronizados para auditorias externas.  
- Unificar dados de plantas/unidades diferentes em um único padrão.  
- Migrar dados históricos para consulta e comparação.


## Perguntas frequentes (FAQ)
- Meu processo usa CSVs próprios. Funciona?  
  Sim. O RPRO foi pensado para ler CSVs das IHMs e adaptar-se ao seu fluxo.

- Já tenho dados antigos. Consigo aproveitar?  
  Sim. Importamos dumps SQL legados (datas DD/MM/YY), com conversão e sanificação.

- Preciso de internet sempre?  
  Não. A aplicação roda localmente (desktop) e suporta operação no ambiente fabril.

- E se eu quiser mudar de banco depois?  
  Sem problema. Exportamos dumps SQL e suportamos SQLite/MySQL.

- Posso personalizar relatórios?  
  Sim. Ajustamos layout, logos e opções de exibição; Excel facilita análises próprias.


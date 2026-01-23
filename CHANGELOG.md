# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2026-01-23

### Adicionado
- **Sistema de Importação de Dados Aprimorado**
  - Novo mapeador de disciplinas (`subject-mapper.ts`) para normalização de nomes de matérias
  - Scripts de importação em lote: `import-all.mjs`, `batch-import.mjs`, `import-all-pdfs.js`
  - Suporte para importação de múltiplos PDFs simultaneamente
  - Relatório de correção de importação de dados (`IMPORT_DATA_FIX_REPORT.md`)

### Modificado
- **Schema do Banco de Dados** (`prisma/schema.prisma`)
  - Melhorias na estrutura de dados para suportar importação em massa
  - Otimizações de índices para melhor performance

- **Ações do Dashboard** (`get-dashboard-data.ts`)
  - Otimização de queries para melhor performance
  - Cálculos mais precisos de métricas e estatísticas
  - Melhor tratamento de dados ausentes ou inconsistentes

- **Sistema de Importação** (`import-data.ts`)
  - Integração com o novo mapeador de disciplinas
  - Validação aprimorada de dados importados
  - Melhor tratamento de erros durante importação
  - Logs mais detalhados para debugging

- **Componente Overview** (`Overview.tsx`)
  - Visualizações de dados mais precisas
  - Melhor responsividade em diferentes tamanhos de tela
  - Gráficos otimizados com dados normalizados

- **Parser de Dados** (`parsers.ts`)
  - Melhor extração de dados de PDFs
  - Normalização automática de nomes de disciplinas
  - Tratamento robusto de diferentes formatos de PDF

### Corrigido
- Inconsistências na nomenclatura de disciplinas entre diferentes fontes de dados
- Problemas de performance ao carregar grandes volumes de dados
- Erros de parsing em PDFs com formatos não padronizados
- Duplicação de dados durante importação em lote

## [1.1.0] - 2026-01-23

### Adicionado
- **Sistema de Insights Pedagógicos Completo**
  - Análise de disciplinas com classificação (CRÍTICO, ALERTA, ADEQUADO, EXCELENTE)
  - Identificação de alunos em risco (ALTO, MÉDIO, BAIXO)
  - Análise de padrões comportamentais e correlações
  - Recomendações personalizadas para docentes
  - Sugestões de intervenções pedagógicas
  - Ajustes curriculares fundamentados
  - Documentação completa em `PEDAGOGICAL_INSIGHTS_SYSTEM.md`

- **Assistente de IA (Chatbot)**
  - Interface de chat em linguagem natural
  - Consultas inteligentes sobre dados escolares
  - Integração com sistema de insights pedagógicos

### Modificado
- **README.md**
  - Documentação completa do sistema de insights pedagógicos
  - Instruções de acesso e uso das funcionalidades de IA
  - Atualização da estrutura do projeto

## [1.0.0] - 2026-01-19

### Adicionado
- **Dashboard Principal**
  - Visão geral com métricas consolidadas
  - Cards de resumo (total de alunos, taxas de aprovação/reprovação, total de turmas)
  - Gráficos de pizza para resultados finais e distribuição por gênero
  - Gráfico de barras com média geral por disciplina

- **Análise por Turma**
  - Cards interativos para cada turma
  - Filtros dinâmicos por turno e turma
  - Gráficos comparativos de resultados
  - Gráfico radar para desempenho por disciplina
  - Distribuição de gênero com barras de progresso
  - Tabela detalhada com médias por disciplina

- **Relatórios Detalhados**
  - Filtros avançados por tipo de relatório, turno e turma
  - Cards de resumo com ícones coloridos
  - Indicadores de desempenho
  - Insights automáticos
  - Exportação de relatórios em JSON

- **Lista de Alunos**
  - Busca em tempo real por nome ou turma
  - Filtros múltiplos (turno, turma, resultado, sexo)
  - Ordenação customizável
  - Paginação (25 alunos por página)
  - Exportação para CSV
  - Badges coloridos para status
  - Destaque visual para médias

- **Infraestrutura**
  - Next.js 15 com App Router
  - TypeScript para type safety
  - Tailwind CSS 4 para estilização
  - Prisma ORM com SQLite (dev) / PostgreSQL (prod)
  - shadcn/ui para componentes
  - Recharts para visualizações

### Funcionalidades Técnicas
- Navegação fluida entre seções sem recarregar página
- Filtros dinâmicos que se atualizam em tempo real
- Responsividade completa para todos os tamanhos de tela
- Componentes modulares para fácil manutenção
- Sistema de importação de dados via PDFs

---

## Formato das Versões

- **Major** (X.0.0): Mudanças incompatíveis na API
- **Minor** (0.X.0): Novas funcionalidades mantendo compatibilidade
- **Patch** (0.0.X): Correções de bugs mantendo compatibilidade

## Tipos de Mudanças

- **Adicionado**: Novas funcionalidades
- **Modificado**: Mudanças em funcionalidades existentes
- **Depreciado**: Funcionalidades que serão removidas em breve
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades

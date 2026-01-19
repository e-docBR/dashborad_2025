# 🎓 ColaboraEdu

**ColaboraEdu** é uma plataforma moderna de gestão escolar e análise pedagógica, potencializada por Inteligência Artificial. O sistema visa facilitar o acompanhamento do desempenho escolar, identificar alunos em risco e fornecer insights pedagógicos acionáveis para professores e gestores.

![ColaboraEdu Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Preview) *(Substituir por screenshot real)*

## 🚀 Funcionalidades Principais

### 📊 Painéis de Análise (Analytics)
- **Visão Geral da Escola**: Métricas consolidadas de desempenho, aprovação e frequência.
- **Análise por Turma**: Comparativo de desempenho entre turmas e disciplinas.
- **Risco Acadêmico**: Painel de identificação de alunos prioritários com filtros de gravidade (exclui transferidos/cancelados).
- **Comparativo de Turmas (Battle Mode)**: Gráficos de radar e diferencial para confrontar duas turmas lado a lado.
- **Ranking de Disciplinas**: Leaderboard das turmas com melhor desempenho por matéria.
- **Perfil do Aluno**: Histórico detalhado, notas, frequência e observações pedagógicas.

### 🤖 Inteligência Artificial (AI Powered)
- **Sistema de Alerta Precoce**: Identificação automática de alunos com risco de reprovação ou evasão, baseado em tendências de notas e frequência.
- **Insights Pedagógicos Avançados**: Sistema completo de análise educacional que transforma dados em orientações práticas:
  - **Análise de Disciplinas**: Classificação em CRÍTICO, ALERTA, ADEQUADO ou EXCELENTE
  - **Identificação de Alunos em Risco**: Classificação em ALTO, MÉDIO ou BAIXO com recomendações personalizadas
  - **Análise de Padrões Comportamentais**: Gap de gênero, correlações entre disciplinas e tendências
  - **Recomendações para Docentes**: Ações específicas por disciplina com priorização
  - **Intervenções Pedagógicas**: REMEDIAL, ENRIQUECIMENTO, ADAPTAÇÃO e MONITORIA
  - **Ajustes Curriculares**: Sugestões fundamentadas de modificações curriculares
- **Assistente de Dados (Chatbot)**: Interface de chat em linguagem natural para consultar dados escolares (ex: "Quais alunos do 9º ano A precisam de reforço em Matemática?").

### 🛠️ Gestão Escolar
- Importação de dados via planilhas (Excel/CSV).
- Cadastro e enturmação de alunos.
- Gestão de resultados (notas e avaliações).

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna e robusta para garantir performance, escalabilidade e excelente experiência de usuário:

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand) e [TanStack Query](https://tanstack.com/query)
- **Banco de Dados & ORM**: [SQLite](https://www.sqlite.org/) (Dev) / [PostgreSQL](https://www.postgresql.org/) (Prod) e [Prisma](https://www.prisma.io/)
- **IA**: Integração com LLMs via provedores de API (OpenAI/Google Gemini) - *Mock Provider implementado para testes*.

---

## 🏁 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ ou Bun
- Gerenciador de pacotes npm, yarn, pnpm ou bun.

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/colaboraedu.git
    cd colaboraedu
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    # ou
    bun install
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto basedo no exemplo (se houver) ou configure as chaves necessárias (DATABASE_URL, NEXTAUTH_SECRET, chaves de API de IA).

4.  **Prepare o Banco de Dados**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    # ou
    bun dev
    ```

6.  **Acesse a Aplicação**
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📊 Sistema de Insights Pedagógicos

O sistema inclui uma ferramenta completa de análise educacional que transforma dados brutos em orientações práticas:

### Como Acessar os Insights Pedagógicos

1. **Via Dashboard Principal**:
   - Acesse o Dashboard
   - No menu lateral, clique em "Insights Pedagógicos"
   - Clique em "Acessar Insights Pedagógicos Completos"

2. **Acesso Direto**:
   - Navegue para `/pedagogical-insights`
   - Selecione uma turma no dropdown
   - Explore as diferentes seções de análise

3. **Via AI Chat**:
   - No componente de IA Chat, peça: "Faça uma análise pedagógica da turma [nome]"
   - O sistema gerará insights detalhados automaticamente

### Funcionalidades dos Insights

- **Análise de Disciplinas**: Classificação em CRÍTICO, ALERTA, ADEQUADO ou EXCELENTE
- **Identificação de Alunos em Risco**: Classificação em ALTO, MÉDIO ou BAIXO com recomendações personalizadas
- **Análise de Padrões Comportamentais**: Gap de gênero, correlações entre disciplinas e tendências
- **Recomendações para Docentes**: Ações específicas por disciplina com priorização
- **Intervenções Pedagógicas**: REMEDIAL, ENRIQUECIMENTO, ADAPTAÇÃO e MONITORIA
- **Ajustes Curriculares**: Sugestões fundamentadas de modificações curriculares

### Documentação Completa

Para mais detalhes sobre o sistema de Insights Pedagógicos, consulte o documento [`PEDAGOGICAL_INSIGHTS_SYSTEM.md`](PEDAGOGICAL_INSIGHTS_SYSTEM.md).

---

## � Estrutura do Projeto

```
src/
├── app/                 # Páginas e Rotas (Next.js App Router)
│   ├── actions/         # Server Actions (ai-chat.ts, ai-insights.ts, pedagogical-insights.ts)
│   └── pedagogical-insights/  # Página dedicada de insights pedagógicos
├── components/          # Componentes React reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── dashboard/       # Componentes específicos do dashboard
│   ├── ai/              # Componentes de interface de IA (Chat, Insights)
│   └── PedagogicalInsights.tsx  # Componente de visualização de insights
├── lib/                 # Utilitários e configurações
│   ├── ai/              # Lógica de integração com IA (Providers, Services)
│   ├── db.ts            # Cliente Prisma
│   └── pedagogical-analysis.ts  # Biblioteca de análise pedagógica avançada
├── hooks/               # Custom React Hooks
└── skills/              # Definições de habilidades/competências (se aplicável)
```

## 🤝 Como Contribuir

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`).
3.  Faça o Commit das suas mudanças (`git commit -m 'Adiciona funcionalidade X'`).
4.  Faça o Push para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um Pull Request.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

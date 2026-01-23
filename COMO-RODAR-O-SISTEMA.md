# 🚀 Como Rodar o Sistema ColaboraEdu

Este guia fornece instruções detalhadas para executar o sistema ColaboraEdu em diferentes ambientes.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior (recomendado: 20.x)
- **npm** 9.x ou superior (ou **bun** como alternativa)
- **Git** para controle de versão
- **SQLite** (incluído automaticamente) ou **PostgreSQL** para produção

### Verificar Instalações

```bash
node --version  # Deve retornar v18.x ou superior
npm --version   # Deve retornar 9.x ou superior
git --version   # Qualquer versão recente
```

---

## 🔧 Configuração Inicial

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/dashborad_2025.git
cd dashborad_2025
```

### 2. Instale as Dependências

```bash
npm install
```

**Alternativa com Bun (mais rápido):**
```bash
bun install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="file:./dev.db"

# Autenticação (NextAuth)
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# IA (Opcional - para funcionalidades de IA)
# OPENAI_API_KEY="sua-chave-openai"
# GOOGLE_GEMINI_API_KEY="sua-chave-gemini"
```

**⚠️ Importante:** 
- Para desenvolvimento, o `DATABASE_URL` pode usar SQLite (`file:./dev.db`)
- Para produção, use PostgreSQL: `postgresql://usuario:senha@localhost:5432/colaboraedu`
- Gere um `NEXTAUTH_SECRET` seguro: `openssl rand -base64 32`

### 4. Prepare o Banco de Dados

```bash
# Gerar o Prisma Client
npx prisma generate

# Sincronizar o schema com o banco de dados
npx prisma db push
```

**Para ambiente de produção (com migrations):**
```bash
npx prisma migrate deploy
```

---

## 🏃 Executando o Sistema

### Modo Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em:
- **Local:** http://localhost:3000
- **Rede:** http://[seu-ip]:3000

**Características do modo desenvolvimento:**
- ✅ Hot reload automático
- ✅ Logs detalhados no console
- ✅ Source maps para debugging
- ✅ Mensagens de erro detalhadas

### Modo Produção

#### 1. Build da Aplicação

```bash
npm run build
```

Este comando:
- Compila o TypeScript
- Otimiza os assets
- Gera bundle de produção
- Cria arquivos estáticos

#### 2. Iniciar o Servidor

```bash
npm start
```

O sistema estará disponível em http://localhost:3000

**Características do modo produção:**
- ✅ Performance otimizada
- ✅ Assets minificados
- ✅ Cache agressivo
- ✅ Logs reduzidos

---

## 📊 Importação de Dados

### Importar Dados de PDFs

O sistema possui scripts para importar dados de PDFs de notas escolares:

#### Importação Individual

```bash
node import-all.mjs
```

#### Importação em Lote

```bash
node batch-import.mjs
```

#### Importar Todos os PDFs de uma Pasta

```bash
node import-all-pdfs.js
```

**Localização dos PDFs:**
- Coloque os arquivos PDF na pasta `upload/`
- Os scripts processarão automaticamente todos os PDFs encontrados

**Formato Esperado dos PDFs:**
- Boletins escolares com notas por disciplina
- Informações de alunos (nome, turma, resultado final)
- Dados de frequência (opcional)

---

## 🗄️ Gerenciamento do Banco de Dados

### Visualizar Dados (Prisma Studio)

```bash
npx prisma studio
```

Abre uma interface web em http://localhost:5555 para visualizar e editar dados.

### Resetar Banco de Dados

```bash
npm run db:reset
```

**⚠️ Atenção:** Este comando apaga todos os dados!

### Criar Nova Migration

```bash
npm run db:migrate
```

### Aplicar Schema sem Migrations

```bash
npm run db:push
```

---

## 🐳 Executando com Docker (Opcional)

### Usando Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Build da Imagem Docker

```bash
docker build -t colaboraedu:latest .
```

---

## 🔍 Troubleshooting

### Problema: "Module not found"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Problema: Porta 3000 já em uso

**Solução 1 - Mudar porta:**
```bash
npm run dev -- -p 3001
```

**Solução 2 - Matar processo:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Problema: Erro de conexão com banco de dados

**Solução:**
1. Verifique se o arquivo `.env` existe
2. Confirme que `DATABASE_URL` está correto
3. Execute `npx prisma db push` novamente

### Problema: Build falha

**Solução:**
```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
npm install

# Tentar build novamente
npm run build
```

---

## 📝 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Desenvolvimento | `npm run dev` | Inicia servidor de desenvolvimento |
| Build | `npm run build` | Cria build de produção |
| Start | `npm start` | Inicia servidor de produção |
| Lint | `npm run lint` | Verifica código com ESLint |
| DB Push | `npm run db:push` | Sincroniza schema com DB |
| DB Generate | `npm run db:generate` | Gera Prisma Client |
| DB Migrate | `npm run db:migrate` | Cria e aplica migrations |
| DB Reset | `npm run db:reset` | Reseta banco de dados |

---

## 🌐 Acessando o Sistema

Após iniciar o servidor, acesse:

### Páginas Principais

- **Dashboard:** http://localhost:3000
- **Visão Geral:** http://localhost:3000 (aba padrão)
- **Análise por Turma:** http://localhost:3000 (menu lateral)
- **Relatórios:** http://localhost:3000 (menu lateral)
- **Lista de Alunos:** http://localhost:3000 (menu lateral)
- **Insights Pedagógicos:** http://localhost:3000/pedagogical-insights

### Funcionalidades Disponíveis

1. **Dashboard Principal**
   - Métricas consolidadas
   - Gráficos de desempenho
   - Visão geral da escola

2. **Análise por Turma**
   - Comparativo entre turmas
   - Desempenho por disciplina
   - Distribuição de gênero

3. **Relatórios Detalhados**
   - Filtros avançados
   - Exportação de dados
   - Insights automáticos

4. **Lista de Alunos**
   - Busca e filtros
   - Exportação CSV
   - Perfil detalhado

5. **Insights Pedagógicos**
   - Análise de IA
   - Recomendações personalizadas
   - Identificação de riscos

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca commite o arquivo `.env`**
2. Use senhas fortes para `NEXTAUTH_SECRET`
3. Em produção, use HTTPS
4. Mantenha dependências atualizadas: `npm audit fix`
5. Configure CORS adequadamente
6. Use variáveis de ambiente para dados sensíveis

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Consulte a [documentação completa](README.md)
2. Verifique o [CHANGELOG](CHANGELOG.md) para mudanças recentes
3. Revise o [guia de contribuição](CONTRIBUTING.md)
4. Abra uma issue no GitHub

---

## ✅ Checklist de Verificação

Antes de considerar o sistema pronto para uso:

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados sincronizado (`npx prisma db push`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Servidor iniciado sem erros (`npm run dev`)
- [ ] Dashboard acessível em http://localhost:3000
- [ ] Dados importados (se aplicável)
- [ ] Funcionalidades testadas

---

**Última atualização:** 23/01/2026  
**Versão do Sistema:** 1.2.0

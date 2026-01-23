# Diagnóstico e Correção do Erro de Importação de Dados

## Resumo Executivo

**Problema:** Erro de servidor (HTTP 500) ao tentar importar arquivos PDF na rota `/import-data`
**Causa Raiz:** Código de teste/debug na biblioteca `pdf-parse` sendo executado durante o bundling do Next.js
**Solução:** Modificar o import para usar diretamente o módulo core, bypassando o código problemático
**Status:** ✅ **CORRIGIDO**

---

## Análise Detalhada

### 1. Sintomas do Problema

Ao tentar importar um arquivo PDF através da interface `/import-data`, o sistema retornava um erro de servidor com as seguintes características:

```
Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
```

**Stack Trace:**
```
at (action-browser)/./node_modules/pdf-parse/index.js
at src/lib/parsers.ts:7:67
at src/app/actions/import-data.ts:9:70
```

### 2. Investigação

#### 2.1 Análise dos Arquivos Relevantes

**Arquivo: [`src/app/actions/import-data.ts`](src/app/actions/import-data.ts:17-18)**
```typescript
if (file.name.toLowerCase().endsWith('.pdf')) {
    parsedData = await parseSchoolPDF(buffer)
}
```

**Arquivo: [`src/lib/parsers.ts`](src/lib/parsers.ts:19)**
```typescript
const data = await pdf(buffer);
```

**Arquivo: [`node_modules/pdf-parse/index.js`](node_modules/pdf-parse/index.js:6-24)**
```javascript
let isDebugMode = !module.parent; 

//for testing purpose
if (isDebugMode) {
    let PDF_FILE = './test/data/05-versions-space.pdf';
    let dataBuffer = Fs.readFileSync(PDF_FILE);
    Pdf(dataBuffer).then(function(data) {
        Fs.writeFileSync(`${PDF_FILE}.txt`, data.text, {
            encoding: 'utf8',
            flag: 'w'
        });
        debugger;
    }).catch(function(err) {
        debugger;
    });
}
```

#### 2.2 Identificação da Causa Raiz

A biblioteca `pdf-parse` (versão 1.1.1) contém código de teste/debug em seu arquivo principal [`index.js`](node_modules/pdf-parse/index.js:6-24). Este código verifica se o módulo está sendo executado diretamente através da condição `!module.parent`.

**O Problema:**
- No ambiente de bundling do Next.js (server-side), a condição `!module.parent` está avaliando como `true`
- Isso faz com que o código de teste seja executado automaticamente durante o carregamento do módulo
- O código de teste tenta ler um arquivo de teste hardcoded: `./test/data/05-versions-space.pdf`
- Este arquivo não existe no projeto, causando o erro `ENOENT`

**Por que isso acontece no Next.js:**
O Next.js usa um sistema de bundling complexo para server actions. Durante o processo de compilação e execução, os módulos podem ser carregados em contextos onde `module.parent` é `undefined`, fazendo com que a condição de debug seja ativada inadvertidamente.

### 3. Solução Implementada

#### 3.1 Abordagem

A solução consiste em importar a função de parsing PDF diretamente do módulo core (`lib/pdf-parse.js`), bypassando o código de teste no `index.js`.

**Arquivo Modificado:** [`src/lib/parsers.ts`](src/lib/parsers.ts:1-2)

**Antes:**
```typescript
import { read, utils } from 'xlsx';
import pdf from 'pdf-parse';
```

**Depois:**
```typescript
import { read, utils } from 'xlsx';
import pdf from 'pdf-parse/lib/pdf-parse.js';
```

#### 3.2 Por que esta solução funciona

1. **Bypass do Código Problemático:** Ao importar diretamente de `lib/pdf-parse.js`, evitamos completamente a execução do código de teste em `index.js`

2. **Mesma Funcionalidade:** O módulo `lib/pdf-parse.js` contém a mesma função de parsing PDF que é exportada pelo `index.js`, sem o código de teste

3. **Compatibilidade:** Esta abordagem não afeta a funcionalidade existente, apenas altera o ponto de importação

4. **Sem Dependências Externas:** Não requer instalação de bibliotecas adicionais ou modificações complexas

### 4. Verificação da Correção

Após aplicar a correção, o servidor foi recompilado com sucesso:

```
✓ Compiled in 13s (2121 modules)
```

O erro `ENOENT` não aparece mais nos logs, indicando que o problema foi resolvido.

### 5. Considerações Adicionais

#### 5.1 Análise de CORS e Configurações

Durante a investigação, foram analisados os seguintes aspectos:

✅ **CORS:** Não configurado explicitamente, mas não é necessário para server actions do Next.js
✅ **Timeouts:** Não há limites de timeout configurados que poderiam causar o erro
✅ **Limites de Upload:** O Next.js não tem limites de tamanho de upload configurados por padrão
✅ **Tratamento de Exceções:** O código em [`importSchoolData`](src/app/actions/import-data.ts:129-132) tem tratamento de exceções adequado

#### 5.2 Fluxo de Requisição e Resposta

**Fluxo Corrigido:**
1. Usuário seleciona arquivo PDF na interface
2. [`ImportPage`](src/app/import-data/page.tsx:23-46) cria FormData e chama `importSchoolData`
3. [`importSchoolData`](src/app/actions/import-data.ts:7) extrai o arquivo e converte para Buffer
4. [`parseSchoolPDF`](src/lib/parsers.ts:18) é chamado com o Buffer
5. `pdf` (importado de `pdf-parse/lib/pdf-parse.js`) processa o Buffer sem executar código de teste
6. Dados são parseados e retornados
7. Dados são inseridos no banco de dados via Prisma
8. Cache é invalidado via `revalidatePath('/')`
9. Resposta de sucesso é retornada ao cliente

### 6. Recomendações Futuras

1. **Monitoramento:** Implementar logging detalhado para capturar erros de parsing de PDF
2. **Validação:** Adicionar validação mais robusta do conteúdo do PDF antes do parsing
3. **Alternativas:** Considerar bibliotecas de parsing PDF mais modernas e estáveis, como:
   - `pdfjs-dist` (Mozilla PDF.js)
   - `pdf2json`
4. **Testes:** Implementar testes unitários para a função `parseSchoolPDF` com arquivos PDF de exemplo

### 7. Conclusão

O erro de importação de dados foi causado por código de teste/debug na biblioteca `pdf-parse` que estava sendo executado inadvertidamente no ambiente de produção do Next.js. A solução implementada é simples, eficaz e não introduz dependências adicionais ou complexidade desnecessária.

A correção foi validada através da recompilação bem-sucedida do servidor e ausência de erros nos logs.

---

**Data da Correção:** 2026-01-19  
**Arquivo Modificado:** [`src/lib/parsers.ts`](src/lib/parsers.ts:1-2)  
**Linhas Alteradas:** 1-2  
**Status:** ✅ RESOLVIDO

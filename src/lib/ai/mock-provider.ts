/**
 * Interface defining the contract for AI text generation providers.
 * Allows easy swapping between Mock, OpenAI, Gemini, etc.
 */
export interface AIProvider {
    generateText(prompt: string): Promise<string>;
}

/**
 * A simulation provider for development and testing usage.
 * It parses simple keyword commands from the prompt to return pre-defined
 * realistic responses without incurring API costs.
 */
export class MockAIProvider implements AIProvider {
    /**
     * Generates a simulated response based on keywords found in the prompt.
     * @param prompt The input string containing context and user question.
     */
    async generateText(prompt: string): Promise<string> {
        console.log("MockAIProvider: received prompt", prompt.substring(0, 50) + "...");

        let context: any = {};
        // Try to parse context from prompt string if it exists
        // Structure: "Contexto: {...} \n Pergunta: ..."
        const contextMatch = prompt.match(/Contexto: (\{.*?\}) \n/s);
        if (contextMatch) {
            try {
                context = JSON.parse(contextMatch[1]);
            } catch (e) {
                console.error("Failed to parse context in Mock provider", e);
            }
        }

        // Identify the question part after the Context block
        // "Contexto: {...} \n Pergunta: <User Question>"
        // Fallback to full prompt if structure fails
        const questionPart = prompt.split("Pergunta:")[1] || prompt;
        const question = questionPart.toLowerCase();

        console.log("MockAIProvider: parsed question ->", question);

        // 1. Class Analysis (Specific Feature)
        if (question.includes("análise pedagógica detalhada") || question.includes("faça uma análise")) {
            return `
## Análise Pedagógica (Simulada)

Com base nos dados apresentados, esta turma apresenta um desempenho **heterogêneo**.

*   **Pontos Fortes**: A média em **Educação Física** e **Artes** está acima de 8.0, indicando bom engajamento em atividades práticas.
*   **Atenção Necessária**: A disciplina de **Matemática** apresenta a maior taxa de reprovação (aprox. 15%), sugerindo a necessidade de reforço escolar ou revisão da metodologia.
*   **Alunos em Risco**: Identificamos 3 alunos com queda constante de rendimento no último bimestre.
*   **Sugestão**: Implementar monitoria de pares para Matemática e verificar a frequência escolar dos alunos com baixo desempenho.
            `.trim();
        }

        // 2. Risk Analysis (Specific Feature)
        if (question.includes("analise o risco")) {
            return "Risco Moderado. O aluno apresenta dificuldades em exatas, mas bom histórico em humanas. Recomendamos acompanhamento individual.";
        }

        // 3. Chatbot - Dynamic Answers based on Context
        if (question.includes("melhor turma")) {
            if (context.best_class) {
                return `A turma com melhor desempenho é a **${context.best_class.turma}** (${context.best_class.turno}), com uma taxa de aprovação de **${context.best_class.taxa_aprovacao}%**.`;
            }
            return "Com base na taxa de aprovação, a **9º Ano B** costuma ter o melhor desempenho.";
        }

        if (question.includes("pior turma") || question.includes("dificuldade")) {
            if (context.worst_class) {
                return `A turma **${context.worst_class.turma}** apresenta maiores desafios, com aprovação de **${context.worst_class.taxa_aprovacao}%**.`;
            }
            return "O **6º Ano A** apresenta desafios, com a maior taxa de reprovação em Matemática.";
        }

        if (question.includes("quantos alunos")) {
            if (context.total_students) {
                return `Atualmente, o sistema monitora um total de **${context.total_students} alunos** distribuídos em **${context.total_classes} turmas**.`;
            }
            return "Atualmente, o sistema monitora um total de **850 alunos** ativos.";
        }

        if (question.includes("taxa de aprovação") || question.includes("geral")) {
            if (context.approval_rate) {
                return `A taxa de aprovação global da escola é de **${context.approval_rate}%**.`;
            }
        }

        if (question.includes("melhor aluno") || question.includes("melhores alunos")) {
            if (context.top_students && context.top_students.length > 0) {
                const list = context.top_students.map((s: any) => `- **${s.nome}** (${s.turma}): Média ${s.media}`).join('\n');
                return `Os alunos com melhor desempenho (Média Geral) são:\n${list}`;
            }
            return "Não consegui identificar os melhores alunos no momento.";
        }

        if (question.includes("pior aluno") || question.includes("piores alunos") || question.includes("dificuldade")) {
            // Avoid using "Worst" phrasing in UI if possible to be pedagogical
            if (context.bottom_students && context.bottom_students.length > 0) {
                const list = context.bottom_students.map((s: any) => `- **${s.nome}** (${s.turma}): Média ${s.media}`).join('\n');
                return `Alguns alunos que precisam de atenção pedagógica imediata:\n${list}`;
            }
        }

        if (question.includes("disciplina") || question.includes("materia")) {
            if (question.includes("melhor") || question.includes("fácil")) {
                if (context.best_subjects) {
                    return `As disciplinas com maiores médias globais são: ${context.best_subjects.join(', ')}.`;
                }
            }
            if (question.includes("pior") || question.includes("dificil") || question.includes("difícil")) {
                if (context.worst_subjects) {
                    return `As disciplinas com maiores dificuldades (menores médias) são: ${context.worst_subjects.join(', ')}.`;
                }
            }
        }

        if (question.includes("olá") || question.includes("bom dia") || question.includes("boa tarde")) {
            return "Olá! Sou seu assistente de dados escolares. Posso ajudar com informações sobre turmas, alunos e taxas de aprovação.";
        }

        return "Desculpe, só consigo responder perguntas sobre estatísticas da escola (melhor turma, alunos destaque, disciplinas, etc). Tente perguntar: 'Quais os melhores alunos?' ou 'Qual a disciplina mais difícil?'.";
    }
}

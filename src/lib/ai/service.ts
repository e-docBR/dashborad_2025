import { AIProvider, MockAIProvider } from './mock-provider';

// Factory to get the configured provider
// In usage: const ai = getAIProvider(); await ai.generateText(...);
export function getAIProvider(): AIProvider {
    // In the future, check process.env.OPENAI_API_KEY and return OpenAIProvider
    // For now, default to Mock
    if (process.env.USE_REAL_AI === 'true' && process.env.OPENAI_API_KEY) {
        // return new OpenAIProvider(process.env.OPENAI_API_KEY);
        console.warn("Real AI provider not yet linked, falling back to mock.");
    }
    return new MockAIProvider();
}

export const AIService = {
    async generateClassInsights(className: string, stats: any): Promise<string> {
        const provider = getAIProvider();

        const prompt = `
Faça uma análise pedagógica detalhada da turma ${className}.
Dados: 
- Total de Alunos: ${stats.total_alunos}
- Aprovados: ${stats.aprovados}
- Reprovados: ${stats.reprovados}
- Médias por disciplina: ${JSON.stringify(stats.medias_disciplina)}

Estruture a resposta com:
1. Resumo Geral
2. Disciplinas com Melhores/Piores desempenhos
3. Recomendações para o corpo docente.
        `.trim();

        return provider.generateText(prompt);
    },

    async analyzeStudentRisk(studentName: string, grades: any): Promise<string> {
        const provider = getAIProvider();
        const prompt = `Analise o risco de reprovação para o aluno ${studentName} com as seguintes notas: ${JSON.stringify(grades)}. Responda curto.`;
        return provider.generateText(prompt);
    },

    async chatWithData(question: string, context?: any): Promise<string> {
        const provider = getAIProvider();
        // Here we would normally build a RAG prompt injecting 'context'
        const prompt = `Contexto: ${JSON.stringify(context || {})} \n Pergunta: ${question}`;
        return provider.generateText(prompt);
    }
};

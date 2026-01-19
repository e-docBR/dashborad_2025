/**
 * Interface defining the contract for AI text generation providers.
 * Allows easy swapping between Mock, OpenAI, Gemini, etc.
 */
export interface AIProvider {
    generateText(prompt: string): Promise<string>;
}

/**
 * A simulation provider for development and testing usage.
 * It parses the full DashboardData from the context to provide
 * realistic and dynamic responses without incurring API costs.
 */
export class MockAIProvider implements AIProvider {

    /**
     * Generates a simulated response based on data analysis.
     * @param prompt The input string containing context and user question.
     */
    async generateText(prompt: string): Promise<string> {
        console.log("--- MOCK AI V2.1 ACTIVE ---");
        // 1. Robust Context & Question Parsing
        let context: any = {};
        let q = "";

        // Defined separator in service.ts (MockAIProvider relies on this strict format)
        // Format: "Contexto: <JSON> \n Pergunta: <Question>"
        const separator = " \n Pergunta:";

        if (prompt.includes(separator)) {
            const parts = prompt.split(separator);
            // parts[0] is "Contexto: {...}"
            // parts[1] is "Question"

            // Safer JSON extraction: find first '{' and last '}' in the CONTEXT part only
            const contextPart = parts[0];
            const firstBrace = contextPart.indexOf('{');
            const lastBrace = contextPart.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonStr = contextPart.substring(firstBrace, lastBrace + 1);
                try {
                    context = JSON.parse(jsonStr);
                    // console.log("MockAIProvider: Context parsed. Students count:", context.alunos?.length);
                } catch (e) {
                    console.error("MockAIProvider: JSON Parse Error", e);
                }
            } else {
                console.warn("MockAIProvider: parsing failed - no braces found in context part.");
            }

            q = parts[1].trim().toLowerCase();
        } else {
            // Fallback
            q = prompt.toLowerCase();
        }

        console.log("MockAIProvider: analyzed question ->", q);

        // 3. Dynamic Handlers based on Intent

        // --- Intent: Specific Student Query ---
        // Ex: "Como está o aluno João?", "Notas da Maria"
        if (q.includes("aluno") || q.includes("aluna") || q.includes("notas de")) {
            // Extract potential name (very naive extraction for mock)
            // Looks for words starting with uppercase after "aluno" or "de"
            // In a real LLM this is semantic. Here we iterate to find a match.
            if (context.alunos && Array.isArray(context.alunos)) {
                const foundStudent = context.alunos.find((s: any) =>
                    q.includes(s.nome.toLowerCase())
                );

                if (foundStudent) {
                    const failedSubjects = Object.entries(foundStudent.notas)
                        .filter(([_, score]: [string, any]) => score < 60)
                        .map(([sub, score]: [string, any]) => `${sub} (${score})`);

                    return `
### Análise do Aluno: **${foundStudent.nome}**
*   **Turma**: ${foundStudent.turma} (${foundStudent.turno})
*   **Média Geral**: ${foundStudent.media_geral ? foundStudent.media_geral.toFixed(1) : 'N/A'}
*   **Situação**: ${foundStudent.resultado_final}
*   **Pontos de Atenção**: ${failedSubjects.length > 0 ? `Notas baixas em: ${failedSubjects.join(', ')}.` : 'Nenhuma nota vermelha identificada.'}
                     `.trim();
                }
            }
        }

        // --- Intent: Specific Class Query ---
        // Ex: "Como está a turma 9A?", "Dados do 3º Ano B"
        // Regex to find class names like "9A", "9º A", "6 Ano B", "3B"
        const classRegex = /(?:turma\s+|ano\s+|série\s+)?(\d{1}º?[\s-]*[a-zA-Z])|(?:turma\s+)(\w+)/i;
        const classMatch = q.match(classRegex);

        if (classMatch && (q.includes("turma") || q.includes("como está") || q.includes("analise") || q.includes("dados"))) {
            if (context.estatisticas_por_turma) {
                const turmas = Object.values(context.estatisticas_por_turma) as any[];
                // Try to fuzzy match the class name found
                const search = classMatch[0].replace(/turma|ano|série|º/gi, "").trim();

                const foundClass = turmas.find(t =>
                    t.turma.toLowerCase().replace(/[^a-z0-9]/g, "").includes(search.toLowerCase().replace(/[^a-z0-9]/g, ""))
                );

                if (foundClass) {
                    return `
### Análise da Turma: **${foundClass.turma}** (${foundClass.turno})
*   **Taxa de Aprovação**: ${foundClass.taxa_aprovacao.toFixed(1)}%
*   **Média Geral (Global)**: ${foundClass.media_global_turma ? foundClass.media_global_turma.toFixed(1) : 'N/A'}
*   **Alunos em Risco**: ${foundClass.alunos_risco}
*   **Destaque**: A melhor disciplina da turma é **${Object.entries(foundClass.medias_disciplina).sort(([, a], [, b]) => (b as number) - (a as number))[0][0]}**.
                     `.trim();
                }
            }
        }

        // --- Intent: Best/Worst Classes ---
        // Matches: "melhor turma", "pior turma", "rank turmas", "qual tem melhor desempenho", "maior media"
        const isComparison = (q.includes("turma") || q.includes("turmas") || q.includes("ano") || q.includes("série")) &&
            (q.includes("melhor") || q.includes("maior") || q.includes("destaque") || q.includes("pior") || q.includes("dificuldade") || q.includes("baixa") || q.includes("desempenho") || q.includes("rendimento") || q.includes("média") || q.includes("media"));

        if (isComparison) {
            if (context.estatisticas_por_turma) {
                const turmas = Object.values(context.estatisticas_por_turma) as any[];

                // 1. Filter by Grade (Context Awareness)
                let filteredTurmas = turmas;
                if (q.includes("sexto") || q.includes("6")) filteredTurmas = turmas.filter(t => t.turma.includes("6"));
                if (q.includes("setimo") || q.includes("7")) filteredTurmas = turmas.filter(t => t.turma.includes("7"));
                if (q.includes("oitavo") || q.includes("8")) filteredTurmas = turmas.filter(t => t.turma.includes("8"));
                if (q.includes("nono") || q.includes("9")) filteredTurmas = turmas.filter(t => t.turma.includes("9"));

                // 2. Determine Sorting Metric
                // If user asks about "média" or grades, we calculate avg of subjects.
                // Otherwise we default to Approval Rate (Taxa de Aprovação)
                const useGrades = q.includes("média") || q.includes("media") || q.includes("notas");

                // Helper to get metric for a class
                const getMetric = (t: any) => {
                    if (useGrades) {
                        const grades = Object.values(t.medias_disciplina) as number[];
                        return grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
                    }
                    return t.taxa_aprovacao;
                };

                // 3. Sort
                const isBest = q.includes("melhor") || q.includes("maior") || q.includes("destaque") || q.includes("desempenho") || q.includes("rendimento");
                const sorted = filteredTurmas.sort((a, b) => {
                    const mA = getMetric(a);
                    const mB = getMetric(b);
                    return isBest ? mB - mA : mA - mB;
                });

                const target = sorted[0];
                if (!target) return "Não encontrei turmas correspondentes aos critérios da sua busca.";

                const metricValue = getMetric(target).toFixed(1);
                const metricName = useGrades ? "Média Geral" : "Taxa de Aprovação";
                const suffix = useGrades ? "" : "%";

                const category = isBest ? "melhor desempenho" : "maiores dificuldades";

                return `A turma com **${category}** ${q.includes("6") ? "nos 6º anos" : ""} é a **${target.turma}** (${target.turno}), com **${metricValue}${suffix}** de ${metricName}.`;
            }
        }

        // --- Intent: Risk Analysis ---
        if (q.includes("risco") || q.includes("reprovando")) {
            if (context.alunos) {
                const atRisk = context.alunos.filter((s: any) => {
                    const reprovacoes = Object.values(s.notas).filter((n: any) => n < 60).length;
                    return reprovacoes >= 3 && !['TRANSFERIDO', 'CANCELADO'].includes(s.resultado_final);
                });

                const names = atRisk.slice(0, 5).map((s: any) => s.nome).join(', ');
                const more = atRisk.length > 5 ? ` e mais ${atRisk.length - 5} alunos.` : '.';

                return `Identifiquei **${atRisk.length} alunos** em situação de Risco Crítico (+3 reprovações). Alguns deles: ${names}${more}. Verifique o painel de 'Risco Acadêmico' para detalhes.`;
            }
        }

        // --- Intent: Subject Analysis or General Averages ---
        if (q.includes("matemática") || q.includes("português") || q.includes("história") || q.includes("geografia") || q.includes("ciências") || q.includes("média") || q.includes("media")) {
            // Check for specific subject
            const subjects = ["Matemática", "Português", "História", "Geografia", "Ciências", "Artes", "Educação Física", "Inglês", "Ensino Religioso"];
            const targetSubject = subjects.find(s => q.includes(s.toLowerCase()));

            if (targetSubject) {
                if (context.resumo_geral && context.resumo_geral.medias_gerais_disciplina) {
                    const avg = context.resumo_geral.medias_gerais_disciplina[targetSubject];

                    let rankingInfo = "";
                    if (context.estatisticas_por_turma) {
                        const turmas = Object.values(context.estatisticas_por_turma) as any[];
                        const sorted = turmas
                            .filter(t => t.medias_disciplina && t.medias_disciplina[targetSubject] !== undefined)
                            .sort((a, b) => b.medias_disciplina[targetSubject] - a.medias_disciplina[targetSubject]);

                        const top3 = sorted.slice(0, 3).map((t, i) => `${i + 1}º ${t.turma} (${t.medias_disciplina[targetSubject].toFixed(1)})`).join(', ');
                        if (top3) rankingInfo = `\n\n🏆 **Top 3 Turmas em ${targetSubject}:** ${top3}.`;
                    }

                    return `A média global da escola em **${targetSubject}** é de **${avg ? avg.toFixed(1) : 'N/A'}**.${rankingInfo}`;
                }
            }
        }

        // --- Intent: General Stats ---
        if (q.includes("total de alunos") || q.includes("quantos alunos")) {
            if (context.resumo_geral) {
                return `A escola possui atualmente **${context.resumo_geral.total_alunos} alunos** matriculados.`;
            }
        }

        // Fallback / Greeting
        if (q.includes("olá") || q.includes("oi") || q.includes("ajuda")) {
            return `Olá! Sou seu assistente inteligente. Analiso os dados da escola em tempo real. Tente me perguntar:
- "Como está o aluno [Nome]?"
- "Qual a melhor turma?"
- "Quantos alunos estão em risco?"
- "Qual a média de Matemática?"`;
        }

        // Improved Fallback with Debug info (implicitly useful)
        return `Não entendi totalmente sua pergunta. Tente ser mais específico, por exemplo: "Qual a melhor turma?", "Como está o aluno João?", "Média de Português". (Entendi que você falou sobre: "${q}")`;
    }
}

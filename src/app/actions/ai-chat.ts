'use server'

import { AIService } from "@/lib/ai/service"
import { getDashboardData } from "@/app/actions/get-dashboard-data"

export async function chatWithData(message: string) {
    try {
        // Fetch full aggregated data to give the AI (or Mock) proper context
        const data = await getDashboardData();

        // 1. Calculate Top/Bottom Students
        const sortedStudents = [...data.alunos]
            .filter(s => s.media_geral !== null)
            .sort((a, b) => b.media_geral - a.media_geral);

        const top_students = sortedStudents.slice(0, 5).map(s => ({
            nome: s.nome,
            turma: s.turma,
            media: s.media_geral.toFixed(1)
        }));

        const bottom_students = sortedStudents.slice(-5).reverse().map(s => ({
            nome: s.nome,
            turma: s.turma,
            media: s.media_geral.toFixed(1)
        }));

        // 2. Best/Worst Subjects
        const subjects = Object.entries(data.resumo_geral.medias_gerais_disciplina)
            .sort(([, a], [, b]) => b - a);

        const best_subjects = subjects.slice(0, 3).map(([k, v]) => `${k} (${v})`);
        const worst_subjects = subjects.slice(-3).reverse().map(([k, v]) => `${k} (${v})`);

        // Lightweight context object to avoid huge payload if using real token-based AI
        // Lightweight context object to avoid huge payload if using real token-based AI
        // BUT for our MockAIProvider upgrade, we need the full data to perform dynamic analysis.
        const context = {
            total_students: data.resumo_geral.total_alunos,
            approval_rate: data.resumo_geral.taxa_aprovacao_global,
            // Full data injection for Mock Provider logic - Sanitized to reduce size
            estatisticas_por_turma: data.estatisticas_por_turma, // This is already summary data
            alunos: data.alunos.map(a => ({
                nome: a.nome,
                turma: a.turma,
                turno: a.turno,
                media_geral: a.media_geral,
                resultado_final: a.resultado_final,
                notas: a.notas // Keep grades for specific analysis
            })),
            resumo_geral: {
                total_alunos: data.resumo_geral.total_alunos,
                taxa_aprovacao_global: data.resumo_geral.taxa_aprovacao_global,
                medias_gerais_disciplina: data.resumo_geral.medias_gerais_disciplina
            }
        };

        const response = await AIService.chatWithData(message, context);
        return { success: true, text: response };

    } catch (e) {
        console.error(e);
        return { success: false, text: "Desculpe, não consegui processar sua pergunta agora." };
    }
}

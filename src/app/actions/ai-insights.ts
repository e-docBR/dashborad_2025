'use server'

import { AIService } from "@/lib/ai/service"
import { db } from "@/lib/db"

export async function getClassInsights(classId: string) {
    try {
        // Need to fetch stats first to pass to AI
        // For simplicity, we might re-calculate or just blindly ask AI if we pass the aggregate object
        // But the previous "getDashboardData" did a lot of agg in-memory. 
        // Let's assume we pass the raw aggregate or re-fetch for this specific class.

        // Fetch specific class data
        const turma = await db.class.findFirst({
            where: {
                OR: [
                    { id: classId },
                    { name: classId } // Allow searching by name if ID fails
                ]
            },
            include: { students: { include: { results: true } } }
        });

        if (!turma) {
            return { success: false, text: "Turma não encontrada." };
        }

        // Calculate basic stats for the prompt
        let aprovados = 0;
        let reprovados = 0;
        const subjectSums: Record<string, { sum: number, count: number }> = {};

        turma.students.forEach(s => {
            if (s.status === 'APROVADO') aprovados++;
            else if (s.status === 'REPROVADO') reprovados++;

            s.results.forEach(r => {
                if (!subjectSums[r.subject]) subjectSums[r.subject] = { sum: 0, count: 0 };
                subjectSums[r.subject].sum += r.score;
                subjectSums[r.subject].count++;
            });
        });

        const medias_disciplina: Record<string, number> = {};
        for (const [sub, val] of Object.entries(subjectSums)) {
            medias_disciplina[sub] = parseFloat((val.sum / val.count).toFixed(1));
        }

        // Call AI Service
        const insights = await AIService.generateClassInsights(turma.name, {
            total_alunos: turma.students.length,
            aprovados,
            reprovados,
            medias_disciplina
        });

        return { success: true, text: insights };

    } catch (e) {
        console.error(e);
        return { success: false, text: "Erro ao gerar insights." };
    }
}

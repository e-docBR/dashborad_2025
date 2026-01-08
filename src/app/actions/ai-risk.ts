'use server'

import { AIService } from "@/lib/ai/service"
import { db } from "@/lib/db"

export interface RiskAnalysisResult {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
}

export async function analyzeStudentRisk(studentId: string): Promise<{ success: boolean, data?: RiskAnalysisResult, message?: string }> {
    try {
        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { results: true }
        });

        if (!student) {
            return { success: false, message: "Aluno não encontrado." };
        }

        // Heuristic Pre-Check
        const failingGrades = student.results.filter(r => r.score < 60); // Assuming 60 is passing
        const failingCount = failingGrades.length;

        // If everything is fine, don't waste AI tokens (or return Low Risk)
        if (failingCount === 0) {
            return {
                success: true,
                data: { level: 'LOW', reason: "Boas notas em todas as disciplinas." }
            };
        }

        // Prepare data for AI
        const gradesSummary = student.results.reduce((acc, r) => {
            acc[r.subject] = r.score;
            return acc;
        }, {} as Record<string, number>);

        // Prompt AI
        const aiResponse = await AIService.analyzeStudentRisk(student.name, gradesSummary);

        // Parse AI response (Mock usually returns plain text, let's normalize it)
        // For this demo, we trust the heuristic more for the "Level" but use AI for the "Reason"

        let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (failingCount >= 3) level = 'HIGH';
        else if (failingCount >= 1) level = 'MEDIUM';

        return {
            success: true,
            data: {
                level,
                reason: aiResponse // e.g. "Risco Moderado. Dificuldades em exatas..."
            }
        };

    } catch (e) {
        console.error(e);
        return { success: false, message: "Erro na análise de risco." };
    }
}

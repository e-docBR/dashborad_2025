'use server'

import { db } from "@/lib/db"
import { generatePedagogicalInsights, ClassData, StudentData } from "@/lib/pedagogical-analysis"

export async function getPedagogicalInsights(classId: string) {
    try {
        // Fetch specific class data
        const turma = await db.class.findFirst({
            where: {
                OR: [
                    { id: classId },
                    { name: classId }
                ]
            },
            include: { students: { include: { results: true } } }
        });

        if (!turma) {
            return { success: false, error: "Turma não encontrada." };
        }

        // Calculate statistics
        let aprovados = 0;
        let reprovados = 0;
        let apcc = 0;
        let transferidos = 0;
        let desistentes = 0;
        let cancelados = 0;
        let masculino = 0;
        let feminino = 0;
        const subjectSums: Record<string, { sum: number, count: number }> = {};

        // Prepare student data
        const studentsData: StudentData[] = [];

        turma.students.forEach(s => {
            if (s.status === 'APROVADO') aprovados++;
            else if (s.status === 'REPROVADO') reprovados++;
            else if (s.status === 'APCC') apcc++;
            else if (s.status === 'TRANSFERIDO') transferidos++;
            else if (s.status === 'DESISTENTE') desistentes++;
            else if (s.status === 'CANCELADO') cancelados++;

            if (s.sex === 'M') masculino++;
            else if (s.sex === 'F') feminino++;

            const notas: Record<string, number> = {};
            s.results.forEach(r => {
                notas[r.subject] = r.score;

                if (!subjectSums[r.subject]) subjectSums[r.subject] = { sum: 0, count: 0 };
                subjectSums[r.subject].sum += r.score;
                subjectSums[r.subject].count++;
            });

            // Calculate average
            const scores = s.results.map(r => r.score);
            const media_geral = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

            studentsData.push({
                nome: s.name,
                data_nascimento: s.birthDate || '--/--/----',
                sexo: s.sex || '?',
                turma: turma.name,
                turno: 'MATUTINO', // Default, could be enhanced
                notas,
                media_geral,
                resultado_final: s.status || 'INDEFINIDO'
            });
        });

        const medias_disciplina: Record<string, number> = {};
        for (const [sub, val] of Object.entries(subjectSums)) {
            medias_disciplina[sub] = parseFloat((val.sum / val.count).toFixed(1));
        }

        // Prepare class data
        const classData: ClassData = {
            total_alunos: turma.students.length,
            aprovados,
            reprovados,
            apcc,
            transferidos,
            desistentes,
            cancelados,
            taxa_aprovacao: turma.students.length > 0 ? parseFloat(((aprovados / turma.students.length) * 100).toFixed(2)) : 0,
            medias_disciplina,
            masculino,
            feminino,
            turma: turma.name,
            turno: 'MATUTINO' // Default, could be enhanced
        };

        // Generate comprehensive pedagogical insights
        const insights = generatePedagogicalInsights(classData, studentsData);

        return { 
            success: true, 
            data: insights,
            className: turma.name
        };

    } catch (e) {
        console.error(e);
        return { success: false, error: "Erro ao gerar insights pedagógicos." };
    }
}

export async function getAllClassesRiskSummary() {
    try {
        const classes = await db.class.findMany({
            include: {
                students: {
                    include: { results: true }
                }
            }
        });

        const summary = classes.map(turma => {
            let aprovados = 0;
            let reprovados = 0;
            const subjectSums: Record<string, { sum: number, count: number }> = {};
            const studentsData: StudentData[] = [];

            turma.students.forEach(s => {
                if (s.status === 'APROVADO') aprovados++;
                else if (s.status === 'REPROVADO') reprovados++;

                const notas: Record<string, number> = {};
                s.results.forEach(r => {
                    notas[r.subject] = r.score;

                    if (!subjectSums[r.subject]) subjectSums[r.subject] = { sum: 0, count: 0 };
                    subjectSums[r.subject].sum += r.score;
                    subjectSums[r.subject].count++;
                });

                const scores = s.results.map(r => r.score);
                const media_geral = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

                studentsData.push({
                    nome: s.name,
                    data_nascimento: s.birthDate || '--/--/----',
                    sexo: s.sex || '?',
                    turma: turma.name,
                    turno: 'MATUTINO',
                    notas,
                    media_geral,
                    resultado_final: s.status || 'INDEFINIDO'
                });
            });

            const medias_disciplina: Record<string, number> = {};
            for (const [sub, val] of Object.entries(subjectSums)) {
                medias_disciplina[sub] = parseFloat((val.sum / val.count).toFixed(1));
            }

            const classData: ClassData = {
                total_alunos: turma.students.length,
                aprovados,
                reprovados,
                apcc: 0,
                transferidos: 0,
                desistentes: 0,
                cancelados: 0,
                taxa_aprovacao: turma.students.length > 0 ? parseFloat(((aprovados / turma.students.length) * 100).toFixed(2)) : 0,
                medias_disciplina,
                masculino: 0,
                feminino: 0,
                turma: turma.name,
                turno: 'MATUTINO'
            };

            const insights = generatePedagogicalInsights(classData, studentsData);

            return {
                turma: turma.name,
                taxa_aprovacao: classData.taxa_aprovacao,
                alunos_em_risco: insights.alunos_em_risco.length,
                disciplinas_criticas: insights.analise_disciplinas.filter(s => s.nivel === 'CRÍTICO').length,
                situacao: insights.resumo_geral.situacao_turma
            };
        });

        return { success: true, data: summary };

    } catch (e) {
        console.error(e);
        return { success: false, error: "Erro ao gerar resumo de risco." };
    }
}

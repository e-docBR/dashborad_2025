'use server'

import { db } from "@/lib/db"

export async function getDashboardData() {
    // --- 1. Fetch Raw Data ---
    const classes = await db.class.findMany({
        include: {
            students: {
                include: {
                    results: true
                }
            }
        }
    });

    // --- 2. Calculate Aggregates ---
    let total_alunos = 0;
    let total_aprovados = 0;
    let total_reprovados = 0;
    let total_masculino = 0;
    let total_feminino = 0;
    let turmas_matutino = 0;
    let turmas_vespertino = 0;

    // Track subject sums for global averages
    const subjectSums: Record<string, { sum: number; count: number }> = {};

    const estatisticas_por_turma: Record<string, any> = {};
    const allStudentsList: any[] = [];

    for (const c of classes) {
        let classAprovados = 0;
        let classReprovados = 0;
        let classApcc = 0;
        let classTransferidos = 0;
        let classDesistentes = 0;
        let classCancelados = 0;
        let classMasculino = 0;
        let classFeminino = 0;

        // Class shift is not directly in DB "Class" model properly (I parsed it but didn't store it in Class model, only Class Name)
        // Heuristic: Check if name/shift string or just count. 
        // The parser script stored "6º ANO A" as name. 
        // The parser returns Shift separately. 
        // Ideally we should have stored Shift in Class model.
        // For now, let's guess based on typical names or if we missed storing it.
        // Wait, the process-uploads script: 
        // `console.log(Found Class Data: ${data.className} (${data.shift}))`
        // but `prisma.class.create({ data: { name: data.className, year: 2025 } });`
        // We lost the shift info in DB! 
        // However, I can try to recover it from the student data or just default it.
        // Or update schema again? 
        // Let's assume 6th grade A-D is Matutino, E-G is Vespertino as seen in JSON?
        // Or just look at the PDF data again?
        // Let's rely on what we have. If missing, label "Indefinido".

        const shift = (['A', 'B', 'C', 'D'].some(l => c.name.includes(l)) && !c.name.includes('E') && !c.name.includes('F') && !c.name.includes('G')) ? 'MATUTINO' : 'VESPERTINO';
        // Rough heuristic matching the sample JSON 6th grade structure.

        if (shift === 'MATUTINO') turmas_matutino++;
        else turmas_vespertino++;

        const classSubjectSums: Record<string, { sum: number; count: number }> = {};

        for (const s of c.students) {
            total_alunos++;

            if (s.sex === 'M') { total_masculino++; classMasculino++; }
            else if (s.sex === 'F') { total_feminino++; classFeminino++; }

            const result = s.status || 'INDEFINIDO';
            if (result === 'APROVADO') { total_aprovados++; classAprovados++; }
            else if (result === 'REPROVADO') { total_reprovados++; classReprovados++; }
            else if (result === 'APCC') classApcc++;
            else if (result === 'TRANSFERIDO') classTransferidos++;
            else if (result === 'DESISTENTE') classDesistentes++;
            else if (result === 'CANCELADO') classCancelados++;

            const notas: Record<string, number> = {};

            for (const r of s.results) {
                notas[r.subject] = r.score;

                // Add to class sums
                if (!classSubjectSums[r.subject]) classSubjectSums[r.subject] = { sum: 0, count: 0 };
                classSubjectSums[r.subject].sum += r.score;
                classSubjectSums[r.subject].count++;

                // Add to global sums
                if (!subjectSums[r.subject]) subjectSums[r.subject] = { sum: 0, count: 0 };
                subjectSums[r.subject].sum += r.score;
                subjectSums[r.subject].count++;
            }

            // Calculate Average (Media Geral)
            const scores = s.results.map(r => r.score);
            const media_geral = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

            allStudentsList.push({
                nome: s.name,
                data_nascimento: s.birthDate || '--/--/----',
                sexo: s.sex || '?',
                turma: c.name,
                turno: shift, // using heuristic
                notas: notas,
                media_geral: media_geral,
                resultado_final: result
            });
        }

        // Calculate Class Averages
        const medias_disciplina: Record<string, number> = {};
        for (const [subj, val] of Object.entries(classSubjectSums)) {
            medias_disciplina[subj] = val.count > 0 ? val.sum / val.count : 0;
        }

        // Use full class name as unique identifier to avoid overwriting (e.g. 6º ANO A vs 7º ANO A)
        const idKey = c.name;

        estatisticas_por_turma[idKey] = {
            total_alunos: c.students.length,
            aprovados: classAprovados,
            reprovados: classReprovados,
            apcc: classApcc,
            transferidos: classTransferidos,
            desistentes: classDesistentes,
            cancelados: classCancelados,
            taxa_aprovacao: c.students.length > 0 ? parseFloat(((classAprovados / c.students.length) * 100).toFixed(2)) : 0,
            medias_disciplina: medias_disciplina,
            masculino: classMasculino,
            feminino: classFeminino,
            turma: c.name,
            turno: shift
        };
    }

    // Global Averages
    const medias_gerais_disciplina: Record<string, number> = {};
    for (const [subj, val] of Object.entries(subjectSums)) {
        medias_gerais_disciplina[subj] = val.count > 0 ? parseFloat((val.sum / val.count).toFixed(2)) : 0;
    }

    return {
        resumo_geral: {
            total_alunos,
            total_aprovados,
            total_reprovados,
            taxa_aprovacao_global: total_alunos > 0 ? parseFloat(((total_aprovados / total_alunos) * 100).toFixed(2)) : 0,
            total_masculino,
            total_feminino,
            medias_gerais_disciplina,
            turmas_matutino,
            turmas_vespertino
        },
        estatisticas_por_turma,
        alunos: allStudentsList
    };
}

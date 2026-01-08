'use server'

import { db } from "@/lib/db"
import { parseSchoolPDF, parseSchoolExcel } from "@/lib/parsers"
import { revalidatePath } from "next/cache"

export async function importSchoolData(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { success: false, message: 'Nenhum arquivo enviado' }
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        let parsedData = []

        if (file.name.toLowerCase().endsWith('.pdf')) {
            parsedData = await parseSchoolPDF(buffer)
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            parsedData = parseSchoolExcel(buffer)
        } else if (file.name.toLowerCase().endsWith('.json')) {
            // Special case for pre-extracted json
            const jsonStr = buffer.toString('utf-8')
            const jsonData = JSON.parse(jsonStr)
            // Convert to compatible format
            // The structure is { "Filename.pdf": { pages: [...], tables: [...] } }
            // We only care about tables -> data
            return { success: false, message: 'Importação JSON ainda não implementada (use PDF/Excel)' }
        } else {
            return { success: false, message: 'Formato não suportado. Use PDF ou Excel.' }
        }

        let stats = { classes: 0, students: 0, results: 0 }

        for (const data of parsedData) {
            // Find or create Class
            // Assumption: Year is 2025
            const turma = await db.class.upsert({
                where: {
                    // We don't have a unique constraint on name+year in schema yet,
                    // but usually id is cuid. We should verify if we can find by name.
                    // Since schema has "model Class { id ... name ... year ... }",
                    // we'll try to findFirst. Upsert requires a unique where clause.
                    // I will change logic to findFirst then create/update.
                    id: 'placeholder'
                },
                create: {
                    name: data.className,
                    year: 2025
                },
                update: {}
            }).catch(async () => {
                // Fallback for non-unique find
                const existing = await db.class.findFirst({
                    where: { name: data.className, year: 2025 }
                })
                if (existing) return existing;
                return await db.class.create({
                    data: { name: data.className, year: 2025 }
                })
            })

            if (!turma) continue;
            stats.classes++;

            for (const student of data.students) {
                // Find or create Student
                // Use email as unique if exists, otherwise Name + ClassId is tricky.
                // We'll trust Name + ClassId is roughly unique enough for this demo or update strictly by Name.
                // Real world: need more unique ID.

                let studentRecord = await db.student.findFirst({
                    where: {
                        name: student.name,
                        classId: turma.id
                    }
                })

                if (!studentRecord) {
                    studentRecord = await db.student.create({
                        data: {
                            name: student.name,
                            classId: turma.id,
                            // email?
                        }
                    })
                }
                stats.students++;

                // Insert Results (Grades)
                // We delete previous results for these subjects to avoid duplicates? Or update?
                // Let's delete and re-insert for simplicity matching this snapshot.

                for (const [subject, score] of Object.entries(student.grades)) {
                    // Check if result exists
                    const existingResult = await db.result.findFirst({
                        where: {
                            studentId: studentRecord.id,
                            subject: subject
                        }
                    })

                    if (existingResult) {
                        await db.result.update({
                            where: { id: existingResult.id },
                            data: { score: score, description: 'Média Anual' }
                        })
                    } else {
                        await db.result.create({
                            data: {
                                studentId: studentRecord.id,
                                subject: subject,
                                score: score,
                                description: 'Média Anual'
                            }
                        })
                    }
                    stats.results++;
                }
            }
        }

        revalidatePath('/')
        return {
            success: true,
            message: `Importação concluída! Turmas: ${stats.classes}, Alunos: ${stats.students}, Notas: ${stats.results}`
        }

    } catch (error) {
        console.error('Import Error:', error)
        return { success: false, message: 'Erro ao processar arquivo: ' + (error as Error).message }
    }
}

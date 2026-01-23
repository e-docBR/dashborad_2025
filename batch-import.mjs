import { PrismaClient } from '@prisma/client';
import { parseSchoolPDF } from './src/lib/parsers.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new PrismaClient();
const uploadDir = path.join(__dirname, 'upload');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDF files to import\n`);

async function importAll() {
    let stats = { classes: 0, students: 0, results: 0 };

    for (const filename of files) {
        console.log(`Processing ${filename}...`);
        const filePath = path.join(uploadDir, filename);
        const buffer = fs.readFileSync(filePath);

        try {
            const parsedData = await parseSchoolPDF(buffer);

            for (const data of parsedData) {
                // Find or create Class
                let turma = await db.class.findFirst({
                    where: { name: data.className, year: 2025 }
                });

                if (!turma) {
                    turma = await db.class.create({
                        data: {
                            name: data.className,
                            year: 2025,
                            shift: data.shift
                        }
                    });
                    stats.classes++;
                } else if (turma.shift !== data.shift) {
                    turma = await db.class.update({
                        where: { id: turma.id },
                        data: { shift: data.shift }
                    });
                }

                for (const student of data.students) {
                    let studentRecord = await db.student.findFirst({
                        where: { name: student.name, classId: turma.id }
                    });

                    if (!studentRecord) {
                        studentRecord = await db.student.create({
                            data: {
                                name: student.name,
                                classId: turma.id,
                                birthDate: student.birthDate,
                                sex: student.sex,
                                status: student.result
                            }
                        });
                        stats.students++;
                    }

                    // Insert Results
                    for (const [subject, score] of Object.entries(student.grades)) {
                        const existingResult = await db.result.findFirst({
                            where: { studentId: studentRecord.id, subject: subject }
                        });

                        if (existingResult) {
                            await db.result.update({
                                where: { id: existingResult.id },
                                data: { score: score, description: 'Média Anual' }
                            });
                        } else {
                            await db.result.create({
                                data: {
                                    studentId: studentRecord.id,
                                    subject: subject,
                                    score: score,
                                    description: 'Média Anual'
                                }
                            });
                            stats.results++;
                        }
                    }
                }
            }

            console.log(`  ✓ Imported successfully`);
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Classes: ${stats.classes}`);
    console.log(`Students: ${stats.students}`);
    console.log(`Results: ${stats.results}`);

    await db.$disconnect();
}

importAll().catch(console.error);

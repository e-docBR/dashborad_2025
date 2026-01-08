import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseSchoolPDF } from '../src/lib/parsers';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'upload');

async function main() {
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

    console.log(`Found ${files.length} PDF files to process.`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const filePath = path.join(UPLOAD_DIR, file);
        const buffer = fs.readFileSync(filePath);

        try {
            const parsedData = await parseSchoolPDF(buffer);

            for (const data of parsedData) {
                console.log(`  -> Found Class Data: ${data.className} (${data.shift})`);

                // Create/Update Class
                let turma = await prisma.class.findFirst({
                    where: { name: data.className, year: 2025 }
                });

                if (!turma) {
                    turma = await prisma.class.create({
                        data: { name: data.className, year: 2025 }
                    });
                }

                console.log(`     Database Class: ${turma.name} (${data.students.length} students to process)`);

                for (const student of data.students) {
                    // Basic unique check: Name + ClassId
                    let studentRecord = await prisma.student.findFirst({
                        where: { name: student.name, classId: turma.id }
                    });

                    if (!studentRecord) {
                        studentRecord = await prisma.student.create({
                            data: {
                                name: student.name,
                                classId: turma.id,
                                sex: student.sex,
                                birthDate: student.birthDate,
                                status: student.result
                            }
                        });
                    } else {
                        // Update existing student info just in case
                        await prisma.student.update({
                            where: { id: studentRecord.id },
                            data: {
                                sex: student.sex,
                                birthDate: student.birthDate,
                                status: student.result
                            }
                        });
                    }

                    // Handle Grades
                    for (const [subject, score] of Object.entries(student.grades)) {
                        const existingResult = await prisma.result.findFirst({
                            where: { studentId: studentRecord.id, subject: subject }
                        });

                        if (existingResult) {
                            await prisma.result.update({
                                where: { id: existingResult.id },
                                data: { score: score, description: 'Média Anual' }
                            });
                        } else {
                            await prisma.result.create({
                                data: {
                                    studentId: studentRecord.id,
                                    subject: subject,
                                    score: score,
                                    description: 'Média Anual'
                                }
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

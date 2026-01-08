import { read, utils } from 'xlsx';
import pdf from 'pdf-parse';

export interface ParsedStudent {
    name: string;
    birthDate?: string;
    sex?: string;
    grades: Record<string, number>;
    result: string;
}

export interface ParsedData {
    className: string;
    shift: string;
    students: ParsedStudent[];
}

export async function parseSchoolPDF(buffer: Buffer): Promise<ParsedData[]> {
    const data = await pdf(buffer);
    const text = data.text;
    const lines = text.split('\n');

    let currentClass = "";
    let currentShift = "";
    const students: ParsedStudent[] = [];

    // Try to find class and shift info from header
    // Example: "6º ANO A MATUTINO"
    const headerMatch = text.match(/(\d+º ANO [A-Z])\s+(MATUTINO|VESPERTINO|NOTURNO)/);
    if (headerMatch) {
        currentClass = headerMatch[1];
        currentShift = headerMatch[2];
    }

    // Map of potential subjects based on order in text (this is an assumption, ideally we parse the header)
    // Based on JSON: Português, Arte, Filosofia, Inglês, Matemática, Ciências, Geografia, História, Religião
    const subjects = [
        "Português", "Arte", "Filosofia", "Inglês",
        "Matemática", "Ciências", "Geografia", "História", "Religião"
    ];

    // Regexes
    // 1. Date Start Line (Date + ...): Missing Name at start
    const dateStartRegex = /^(\d{2}\/\d{2}\/\d{4})(?:[ ]?)([MF])(?:[ ]?)([\d,.-]+)(APROVADO|REPROVADO|APCC|TRANSFERIDO|DESISTENTE|CANCELADO)$/;

    // Buffer to hold potential name lines
    let nameBuffer: string[] = [];

    // Header keywords to ignore when buffering names
    const headerKeywords = [
        "Prefeitura", "CNPJ", "Secretaria", "ATA", "Turma", "DISCIPLINAS",
        "Nascimento", "Escola", "INEP", "AV.", "Assinatura", "Alunos", "SEXO",
        "RESULTADO", "MÉDIA", "Turno", "Data de", "Graus", "Municipal",
        "ASÊUGUTROP", "AUGNÍL", "ETRA", "ACISÍF", "OÃÇACUDE", "ASELGNI",
        "ACITÁMETAM", "SAICNÊIC", "AIFARGOEG", "AIRÓTSIH", "OSOIGILER", "ONISNE"
    ];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Try matching Full Line first (Name + Date...)
        // We look for the Date pattern presence
        const dateIndex = trimmed.search(/\d{2}\/\d{2}\/\d{4}/);

        let matchData: { name: string, birthDate: string, sex: string, rawGrades: string, result: string } | null = null;

        if (dateIndex > 0) {
            // Potential Full Line (Name before Date)
            // Extract Name part
            const namePart = trimmed.substring(0, dateIndex).trim();
            const rest = trimmed.substring(dateIndex);

            // Validate the rest matches Date... pattern
            const restMatch = rest.match(dateStartRegex);
            if (restMatch && namePart.length > 2) {
                matchData = {
                    name: namePart,
                    birthDate: restMatch[1],
                    sex: restMatch[2],
                    rawGrades: restMatch[3],
                    result: restMatch[4]
                };
            }
        } else if (dateIndex === 0) {
            // Line starts with Date (Name is in Buffer)
            const restMatch = trimmed.match(dateStartRegex);
            if (restMatch) {
                // Combine buffer for name
                const bufferedName = nameBuffer.join(" ").trim();
                // Heuristic: If buffer is empty, maybe previous line was skipped?
                // But generally buffer should fill up.
                if (bufferedName.length > 0) {
                    matchData = {
                        name: bufferedName,
                        birthDate: restMatch[1],
                        sex: restMatch[2],
                        rawGrades: restMatch[3],
                        result: restMatch[4]
                    };
                }
            }
        }

        if (matchData) {
            // We found a student! Process Grades
            let gradesVal: number[] = [];
            const { rawGrades } = matchData;

            if (rawGrades.includes(' ')) {
                gradesVal = rawGrades.split(/\s+/).map(g => {
                    if (g === '--' || g === '-') return 0;
                    return parseFloat(g.replace(',', '.'));
                });
            } else {
                const gradeMatches = rawGrades.match(/(\d{1,3},\d|--|-)/g);
                if (gradeMatches) {
                    gradesVal = gradeMatches.map(g => {
                        if (g === '--' || g === '-') return 0;
                        return parseFloat(g.replace(',', '.'));
                    });
                }
            }

            const studentGrades: Record<string, number> = {};
            subjects.forEach((subj, idx) => {
                if (idx < gradesVal.length) {
                    studentGrades[subj] = gradesVal[idx];
                }
            });

            students.push({
                name: matchData.name,
                birthDate: matchData.birthDate,
                sex: matchData.sex,
                grades: studentGrades,
                result: matchData.result
            });

            // Clear buffer
            nameBuffer = [];
        } else {
            // Not a data line. Add to buffer if not junk.
            const isHeader = headerKeywords.some(k => trimmed.includes(k));
            if (!isHeader && trimmed.length > 2) {
                nameBuffer.push(trimmed);
                if (nameBuffer.length > 3) nameBuffer.shift();
            }
        }
    }

    return [{
        className: currentClass || "Desconhecida",
        shift: currentShift || "Desconhecido",
        students
    }];
}

export function parseSchoolExcel(buffer: Buffer): ParsedData[] {
    const wb = read(buffer);
    const results: ParsedData[] = [];

    wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const rawData = utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Simple heuristic: Assume header is row 0 and students start at row 1
        // Columns: Name, Sex, Result, ...Grades
        // This is hard to generalize without a template. 
        // I'll assume we parse a specific template where columns are known or we deduce them.

        // For now, let's implement a "Smart" parser that looks for "Nome", "Resultado", etc.
        let headerRowIdx = -1;
        let headers: string[] = [];

        for (let i = 0; i < Math.min(20, rawData.length); i++) {
            const row = rawData[i];
            if (row.some(c => typeof c === 'string' && c.toLowerCase().includes('nome'))) {
                headerRowIdx = i;
                headers = row.map(c => (c || '').toString());
                break;
            }
        }

        if (headerRowIdx === -1) return;

        const students: ParsedStudent[] = [];

        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const nameIdx = headers.findIndex(h => h.toLowerCase().includes('nome'));
            const resultIdx = headers.findIndex(h => h.toLowerCase().includes('resultado') || h.toLowerCase().includes('situação'));

            if (nameIdx === -1) continue;

            const name = row[nameIdx];
            if (!name || typeof name !== 'string') continue;

            const grades: Record<string, number> = {};

            headers.forEach((h, idx) => {
                if (idx === nameIdx || idx === resultIdx) return;
                // Assume any other column with a number is a grade?
                // Or look for specific subject names.
                const val = row[idx];
                if (typeof val === 'number') {
                    grades[h] = val;
                }
            });

            students.push({
                name,
                grades,
                result: resultIdx !== -1 ? row[resultIdx] : 'Desconhecido'
            });
        }

        results.push({
            className: sheetName,
            shift: 'Desconhecido', // Excel sheets rarely have shift in name unless "6A-MAT"
            students
        });
    });

    return results;
}

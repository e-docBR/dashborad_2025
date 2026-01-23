import { read, utils } from 'xlsx';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { normalizeSubjectName } from './subject-mapper';

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

    console.log('[PDF Parser] Total lines extracted:', lines.length);
    console.log('[PDF Parser] First 10 lines:', lines.slice(0, 10));
    console.log('[PDF Parser] Last 10 lines:', lines.slice(-10));

    let currentClass = "";
    let currentShift = "";
    const students: ParsedStudent[] = [];

    // Try to find class and shift info from header
    // Example: "6º ANO A MATUTINO"
    const headerMatch = text.match(/(\d+º ANO [A-Z])\s+(MATUTINO|VESPERTINO|NOTURNO)/);
    if (headerMatch) {
        currentClass = headerMatch[1];
        currentShift = headerMatch[2];
        console.log('[PDF Parser] Header found - Class:', currentClass, 'Shift:', currentShift);
    } else {
        console.log('[PDF Parser] No header match found');
    }

    // Map of subjects based on actual PDF format
    // From PDF: LÍNGUA PORTUGUÊSA, ARTE, EDUCAÇÃO FÍSICA, LÍNGUA INGLESA, MATEMÁTICA, CIÊNCIAS, GEOGRAFIA, HISTÓRIA, ENSINO RELIGIOSO
    const subjects = [
        "Português", "Arte", "Educação Física", "Inglês",
        "Matemática", "Ciências", "Geografia", "História", "Religião"
    ];

    // Regex for student data line
    // Format: NAME + DATE + SEX + GRADES + RESULT
    // Example: ADASSA VITORIA SOARES MARTINS20/08/2013F53,783,072,070,564,463,072,064,474,0APROVADO
    const studentLineRegex = /^(.+?)(\d{2}\/\d{2}\/\d{4})([MF])([\d,.]+)(APROVADO|REPROVADO|APCC|TRANSFERIDO|DESISTENTE|CANCELADO)$/;

    // Header keywords to ignore

    // Header keywords to ignore
    const headerKeywords = [
        "Prefeitura", "CNPJ", "Secretaria", "ATA", "Turma", "DISCIPLINAS",
        "Nascimento", "Escola", "INEP", "AV.", "Assinatura", "Alunos", "SEXO",
        "RESULTADO", "MÉDIA", "Turno", "Data de", "Graus", "Municipal",
        "LÍNGUA PORTUGUÊSA", "ARTE", "EDUCAÇÃO FÍSICA", "LÍNGUA INGLESA",
        "MATEMÁTICA", "CIÊNCIAS", "GEOGRAFIA", "HISTÓRIA", "ENSINO RELIGIOSO"
    ];

    // Regex for student data line suffix: Date + Sex + Grades + Result
    // Note: Grades can be digits/commas/dots OR dashes (------------------) for Cancelled/Transferred
    const dataRegex = /(\d{2}\/\d{2}\/\d{4})([MF])([\d,.-]+)(APROVADO|REPROVADO|APCC|TRANSFERIDO|DESISTENTE|CANCELADO)$/;

    let nameBuffer: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if header
        const isHeader = headerKeywords.some(k => trimmed.includes(k));
        if (isHeader) {
            // If we hit a header, clear any pending name buffer as it's likely invalid
            if (nameBuffer.length > 0) {
                console.log(`[PDF Parser] Warning: Clearing name buffer due to header: ${nameBuffer.join(' ')}`);
                nameBuffer = [];
            }
            continue;
        }

        // Try to match student data suffix
        const match = trimmed.match(dataRegex);
        if (match) {
            const [, birthDate, sex, rawGrades, result] = match;

            // The start of the line might be the suffix of the name
            const matchIndex = trimmed.indexOf(match[0]);
            const nameSuffix = trimmed.substring(0, matchIndex).trim();

            const fullName = [...nameBuffer, nameSuffix].filter(Boolean).join(" ");
            nameBuffer = []; // Reset buffer

            console.log('[PDF Parser] Student found:', fullName);
            console.log('[PDF Parser] Raw grades:', rawGrades);

            // Parse grades - they are comma-separated without spaces
            // Format: 53,783,072,070,564,463,072,064,474,0
            // Each grade is 4 digits: 2 digits + comma + 1 decimal
            const gradesVal: number[] = [];
            let i = 0;
            while (i < rawGrades.length) {
                // Look for pattern: digits + comma + digit
                const gradeMatch = rawGrades.substring(i).match(/^(\d+,\d)/);
                if (gradeMatch) {
                    const gradeStr = gradeMatch[1];
                    gradesVal.push(parseFloat(gradeStr.replace(',', '.')));
                    i += gradeStr.length;
                } else {
                    // Skip separators or dashes
                    i++;
                }
            }

            console.log('[PDF Parser] Parsed grades:', gradesVal);

            // Map grades to subjects
            const studentGrades: Record<string, number> = {};
            subjects.forEach((subj, idx) => {
                if (idx < gradesVal.length) {
                    studentGrades[subj] = gradesVal[idx];
                }
            });

            students.push({
                name: fullName.trim(),
                birthDate,
                sex,
                grades: studentGrades,
                result
            });
        } else {
            // If no data match, assume it's part of the name
            nameBuffer.push(trimmed);
        }
    }


    console.log('[PDF Parser] Total students parsed:', students.length);
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

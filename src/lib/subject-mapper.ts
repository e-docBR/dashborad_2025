/**
 * Subject Name Normalization Utility
 * 
 * Ensures consistent subject names across different PDF formats and variations
 */

export const SUBJECT_MAPPING: Record<string, string> = {
    // Português variations
    'LÍNGUA PORTUGUÊSA': 'Português',
    'LÍNGUA PORTUGUESA': 'Português',
    'PORTUGUES': 'Português',
    'PORTUGUÊS': 'Português',
    'L. PORTUGUESA': 'Português',

    // Matemática variations
    'MATEMÁTICA': 'Matemática',
    'MATEMATICA': 'Matemática',
    'MAT': 'Matemática',

    // Arte variations
    'ARTE': 'Arte',
    'ARTES': 'Arte',
    'ED. ARTÍSTICA': 'Arte',
    'EDUCAÇÃO ARTÍSTICA': 'Arte',

    // Educação Física variations
    'EDUCAÇÃO FÍSICA': 'Educação Física',
    'EDUCACAO FISICA': 'Educação Física',
    'ED. FÍSICA': 'Educação Física',
    'ED FISICA': 'Educação Física',

    // Inglês variations
    'LÍNGUA INGLESA': 'Inglês',
    'LINGUA INGLESA': 'Inglês',
    'INGLÊS': 'Inglês',
    'INGLES': 'Inglês',
    'L. INGLESA': 'Inglês',

    // Ciências variations
    'CIÊNCIAS': 'Ciências',
    'CIENCIAS': 'Ciências',
    'CIÊNCIA': 'Ciências',
    'CIENCIA': 'Ciências',

    // Geografia variations
    'GEOGRAFIA': 'Geografia',
    'GEO': 'Geografia',

    // História variations
    'HISTÓRIA': 'História',
    'HISTORIA': 'História',
    'HIST': 'História',

    // Ensino Religioso variations
    'ENSINO RELIGIOSO': 'Religião',
    'ENS. RELIGIOSO': 'Religião',
    'RELIGIÃO': 'Religião',
    'RELIGIAO': 'Religião',
    'E. RELIGIOSO': 'Religião',

    // Filosofia variations
    'FILOSOFIA': 'Filosofia',
    'FILOS': 'Filosofia',

    // Sociologia variations
    'SOCIOLOGIA': 'Sociologia',
    'SOCIO': 'Sociologia',
};

/**
 * Normalizes a subject name to its standard form
 * @param raw - Raw subject name from PDF or other source
 * @returns Normalized subject name
 */
export function normalizeSubjectName(raw: string): string {
    if (!raw) return 'Desconhecido';

    const normalized = SUBJECT_MAPPING[raw.toUpperCase().trim()];
    return normalized || raw.trim();
}

/**
 * Get all unique normalized subject names from a list
 * @param subjects - Array of raw subject names
 * @returns Array of unique normalized subject names
 */
export function getUniqueSubjects(subjects: string[]): string[] {
    const normalized = subjects.map(normalizeSubjectName);
    return [...new Set(normalized)].sort();
}

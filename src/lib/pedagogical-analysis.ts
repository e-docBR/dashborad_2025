/**
 * Biblioteca de Análise Pedagógica Avançada
 * 
 * Este módulo fornece funções para análise de dados educacionais,
 * identificação de tendências, padrões de aprendizagem e geração de
 * recomendações pedagógicas personalizadas.
 */

export interface ClassData {
  total_alunos: number
  aprovados: number
  reprovados: number
  apcc: number
  transferidos: number
  desistentes: number
  cancelados: number
  taxa_aprovacao: number
  medias_disciplina: Record<string, number>
  masculino: number
  feminino: number
  turma: string
  turno: string
}

export interface StudentData {
  nome: string
  data_nascimento: string
  sexo: string
  turma: string
  turno: string
  notas: Record<string, number>
  media_geral: number | null
  resultado_final: string
}

export interface SubjectAnalysis {
  nome: string
  media: number
  nivel: 'CRÍTICO' | 'ALERTA' | 'ADEQUADO' | 'EXCELENTE'
  tendencia: 'MELHORANDO' | 'ESTÁVEL' | 'PIORANDO'
  alunos_abaixo_media: number
  alunos_acima_media: number
  gap_genero?: {
    masculino: number
    feminino: number
    diferenca: number
  }
}

export interface RiskStudent {
  nome: string
  turma: string
  nivel_risco: 'ALTO' | 'MÉDIO' | 'BAIXO'
  disciplinas_em_risco: string[]
  media_geral: number
  recomendacoes: string[]
}

export interface PedagogicalInsights {
  resumo_geral: {
    situacao_turma: string
    pontos_fortes: string[]
    pontos_atencao: string[]
  }
  analise_disciplinas: SubjectAnalysis[]
  alunos_em_risco: RiskStudent[]
  padroes_comportamentais: {
    gap_genero: boolean
    correlacao_disciplinas: Array<{disciplina1: string, disciplina2: string, correlacao: number}>
    padroes_desempenho: string[]
  }
  recomendacoes_docentes: {
    disciplina: string
    acoes: string[]
    prioridade: 'ALTA' | 'MÉDIA' | 'BAIXA'
  }[]
  intervencoes_pedagogicas: {
    tipo: 'REMEDIAL' | 'ENRIQUECIMENTO' | 'ADAPTACAO' | 'MONITORIA'
    publico_alvo: string
    descricao: string
    impacto_esperado: string
  }[]
  ajustes_curriculares: {
    area: string
    ajuste: string
    justificativa: string
  }[]
}

/**
 * Analisa o desempenho de uma disciplina específica
 */
export function analyzeSubject(
  subject: string,
  media: number,
  students: StudentData[],
  classData: ClassData
): SubjectAnalysis {
  const studentsWithSubject = students.filter(s => s.notas[subject] !== undefined);
  
  // Nível de desempenho
  let nivel: 'CRÍTICO' | 'ALERTA' | 'ADEQUADO' | 'EXCELENTE';
  if (media < 45) nivel = 'CRÍTICO';
  else if (media < 55) nivel = 'ALERTA';
  else if (media < 70) nivel = 'ADEQUADO';
  else nivel = 'EXCELENTE';

  // Tendência (simulada - em produção usaria dados históricos)
  const tendencia: 'MELHORANDO' | 'ESTÁVEL' | 'PIORANDO' = 'ESTÁVEL';

  // Alunos abaixo e acima da média
  const alunosAbaixoMedia = studentsWithSubject.filter(s => s.notas[subject] < media).length;
  const alunosAcimaMedia = studentsWithSubject.filter(s => s.notas[subject] >= media).length;

  // Gap de gênero
  const maleStudents = studentsWithSubject.filter(s => s.sexo === 'M');
  const femaleStudents = studentsWithSubject.filter(s => s.sexo === 'F');
  
  const maleAvg = maleStudents.length > 0 
    ? maleStudents.reduce((sum, s) => sum + s.notas[subject], 0) / maleStudents.length 
    : 0;
  const femaleAvg = femaleStudents.length > 0 
    ? femaleStudents.reduce((sum, s) => sum + s.notas[subject], 0) / femaleStudents.length 
    : 0;

  const gapGenero = maleStudents.length > 0 && femaleStudents.length > 0 ? {
    masculino: maleAvg,
    feminino: femaleAvg,
    diferenca: Math.abs(maleAvg - femaleAvg)
  } : undefined;

  return {
    nome: subject,
    media,
    nivel,
    tendencia,
    alunos_abaixo_media: alunosAbaixoMedia,
    alunos_acima_media: alunosAcimaMedia,
    gap_genero: gapGenero
  };
}

/**
 * Identifica alunos em risco de reprovação
 */
export function identifyRiskStudents(
  students: StudentData[],
  classData: ClassData
): RiskStudent[] {
  const riskStudents: RiskStudent[] = [];

  for (const student of students) {
    if (student.resultado_final === 'TRANSFERIDO' || student.resultado_final === 'CANCELADO') {
      continue;
    }

    const notas = Object.values(student.notas);
    if (notas.length === 0) continue;

    const mediaGeral = student.media_geral || notas.reduce((a, b) => a + b, 0) / notas.length;
    
    // Disciplinas em risco (nota < 60)
    const disciplinasEmRisco = Object.entries(student.notas)
      .filter(([_, nota]) => nota < 60)
      .map(([disciplina, _]) => disciplina);

    // Nível de risco
    let nivelRisco: 'ALTO' | 'MÉDIO' | 'BAIXO';
    if (disciplinasEmRisco.length >= 4 || mediaGeral < 45) {
      nivelRisco = 'ALTO';
    } else if (disciplinasEmRisco.length >= 2 || mediaGeral < 55) {
      nivelRisco = 'MÉDIO';
    } else if (disciplinasEmRisco.length >= 1) {
      nivelRisco = 'BAIXO';
    } else {
      continue; // Não está em risco
    }

    // Recomendações personalizadas
    const recomendacoes = generateStudentRecommendations(student, disciplinasEmRisco, mediaGeral);

    riskStudents.push({
      nome: student.nome,
      turma: student.turma,
      nivel_risco: nivelRisco,
      disciplinas_em_risco: disciplinasEmRisco,
      media_geral: mediaGeral,
      recomendacoes
    });
  }

  // Ordenar por nível de risco e média
  return riskStudents.sort((a, b) => {
    const riskOrder = { 'ALTO': 0, 'MÉDIO': 1, 'BAIXO': 2 };
    if (riskOrder[a.nivel_risco] !== riskOrder[b.nivel_risco]) {
      return riskOrder[a.nivel_risco] - riskOrder[b.nivel_risco];
    }
    return a.media_geral - b.media_geral;
  });
}

/**
 * Gera recomendações personalizadas para um aluno
 */
function generateStudentRecommendations(
  student: StudentData,
  disciplinasEmRisco: string[],
  mediaGeral: number
): string[] {
  const recomendacoes: string[] = [];

  if (disciplinasEmRisco.length > 0) {
    recomendacoes.push(`Priorizar reforço em: ${disciplinasEmRisco.join(', ')}`);
  }

  // Análise por tipo de disciplina
  const exatas = disciplinasEmRisco.filter(d => 
    ['Matemática', 'Física', 'Química', 'Ciências'].some(e => d.includes(e))
  );
  const humanas = disciplinasEmRisco.filter(d => 
    ['Português', 'História', 'Geografia', 'Filosofia', 'Sociologia'].some(e => d.includes(e))
  );

  if (exatas.length >= 2) {
    recomendacoes.push('Dificuldades em ciências exatas: sugerir monitoria e atividades práticas');
  }
  if (humanas.length >= 2) {
    recomendacoes.push('Dificuldades em ciências humanas: incentivar leitura e debates em sala');
  }

  if (mediaGeral < 45) {
    recomendacoes.push('Risco elevado de reprovação: considerar plano de recuperação intensivo');
    recomendacoes.push('Reunião com responsáveis para discutir estratégias de apoio');
  } else if (mediaGeral < 55) {
    recomendacoes.push('Acompanhamento pedagógico semanal recomendado');
  }

  return recomendacoes;
}

/**
 * Analisa padrões comportamentais da turma
 */
export function analyzeBehavioralPatterns(
  classData: ClassData,
  subjectAnalyses: SubjectAnalysis[],
  students: StudentData[]
): PedagogicalInsights['padroes_comportamentais'] {
  // Gap de gênero
  const gapGenero = subjectAnalyses.some(s => 
    s.gap_genero && s.gap_genero.diferenca > 10
  );

  // Correlações entre disciplinas (simplificada)
  const correlacaoDisciplinas: Array<{disciplina1: string, disciplina2: string, correlacao: number}> = [];
  
  const subjects = Object.keys(classData.medias_disciplina);
  for (let i = 0; i < subjects.length; i++) {
    for (let j = i + 1; j < subjects.length; j++) {
      const s1 = subjects[i];
      const s2 = subjects[j];
      
      // Calcular correlação simples
      const correlacao = calculateCorrelation(students, s1, s2);
      if (Math.abs(correlacao) > 0.5) {
        correlacaoDisciplinas.push({
          disciplina1: s1,
          disciplina2: s2,
          correlacao
        });
      }
    }
  }

  // Padrões de desempenho
  const padroesDesempenho: string[] = [];
  
  const criticalSubjects = subjectAnalyses.filter(s => s.nivel === 'CRÍTICO');
  if (criticalSubjects.length > 0) {
    padroesDesempenho.push(`${criticalSubjects.length} disciplina(s) em nível crítico: ${criticalSubjects.map(s => s.nome).join(', ')}`);
  }

  const excellentSubjects = subjectAnalyses.filter(s => s.nivel === 'EXCELENTE');
  if (excellentSubjects.length > 0) {
    padroesDesempenho.push(`${excellentSubjects.length} disciplina(s) com desempenho excelente: ${excellentSubjects.map(s => s.nome).join(', ')}`);
  }

  if (classData.taxa_aprovacao < 60) {
    padroesDesempenho.push('Taxa de aprovação abaixo da meta institucional (60%)');
  } else if (classData.taxa_aprovacao > 85) {
    padroesDesempenho.push('Taxa de aprovação acima da meta institucional');
  }

  return {
    gap_genero: gapGenero,
    correlacao_disciplinas: correlacaoDisciplinas,
    padroes_desempenho: padroesDesempenho
  };
}

/**
 * Calcula correlação entre duas disciplinas
 */
function calculateCorrelation(students: StudentData[], subject1: string, subject2: string): number {
  const pairs = students
    .filter(s => s.notas[subject1] !== undefined && s.notas[subject2] !== undefined)
    .map(s => ({ x: s.notas[subject1], y: s.notas[subject2] }));

  if (pairs.length < 2) return 0;

  const n = pairs.length;
  const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
  const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
  const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Gera recomendações para docentes
 */
export function generateTeacherRecommendations(
  subjectAnalyses: SubjectAnalysis[],
  classData: ClassData
): PedagogicalInsights['recomendacoes_docentes'] {
  const recomendacoes: PedagogicalInsights['recomendacoes_docentes'] = [];

  for (const subject of subjectAnalyses) {
    const acoes: string[] = [];
    let prioridade: 'ALTA' | 'MÉDIA' | 'BAIXA' = 'MÉDIA';

    if (subject.nivel === 'CRÍTICO') {
      prioridade = 'ALTA';
      acoes.push('Revisar metodologia de ensino imediatamente');
      acoes.push('Implementar atividades de recuperação paralela');
      acoes.push('Avaliar se o conteúdo está adequado ao nível da turma');
      acoes.push('Considerar uso de recursos audiovisuais e práticos');
    } else if (subject.nivel === 'ALERTA') {
      prioridade = 'MÉDIA';
      acoes.push('Monitorar de perto alunos com notas abaixo da média');
      acoes.push('Reforçar conceitos fundamentais');
      acoes.push('Aumentar frequência de avaliações formativas');
    } else if (subject.nivel === 'EXCELENTE') {
      prioridade = 'BAIXA';
      acoes.push('Manter estratégias atuais de ensino');
      acoes.push('Considerar atividades de enriquecimento para alunos avançados');
    }

    if (subject.gap_genero && subject.gap_genero.diferenca > 10) {
      const generoMaior = subject.gap_genero.masculino > subject.gap_genero.feminino ? 'masculino' : 'feminino';
      acoes.push(`Atenção ao gap de gênero: desempenho ${generoMaior} é ${subject.gap_genero.diferenca.toFixed(1)} pontos maior`);
      acoes.push('Adotar estratégias inclusivas que engajem ambos os gêneros');
    }

    if (acoes.length > 0) {
      recomendacoes.push({
        disciplina: subject.nome,
        acoes,
        prioridade
      });
    }
  }

  return recomendacoes;
}

/**
 * Propõe intervenções pedagógicas
 */
export function proposePedagogicalInterventions(
  riskStudents: RiskStudent[],
  subjectAnalyses: SubjectAnalysis[],
  classData: ClassData
): PedagogicalInsights['intervencoes_pedagogicas'] {
  const intervencoes: PedagogicalInsights['intervencoes_pedagogicas'] = [];

  // Intervenções para alunos em risco alto
  const highRiskStudents = riskStudents.filter(s => s.nivel_risco === 'ALTO');
  if (highRiskStudents.length > 0) {
    intervencoes.push({
      tipo: 'REMEDIAL',
      publico_alvo: `${highRiskStudents.length} alunos em risco alto`,
      descricao: 'Implementar programa de recuperação intensiva com aulas extras e monitoria individualizada',
      impacto_esperado: 'Redução de 30-40% na taxa de reprovação deste grupo'
    });
  }

  // Intervenções para disciplinas críticas
  const criticalSubjects = subjectAnalyses.filter(s => s.nivel === 'CRÍTICO');
  if (criticalSubjects.length > 0) {
    for (const subject of criticalSubjects) {
      intervencoes.push({
        tipo: 'ADAPTACAO',
        publico_alvo: `Turma inteira - ${subject.nome}`,
        descricao: `Reestruturar abordagem pedagógica de ${subject.nome} com foco em metodologias ativas e aprendizagem significativa`,
        impacto_esperado: 'Aumento de 15-20 pontos na média da disciplina'
      });
    }
  }

  // Intervenções de enriquecimento
  const excellentSubjects = subjectAnalyses.filter(s => s.nivel === 'EXCELENTE');
  if (excellentSubjects.length > 0) {
    intervencoes.push({
      tipo: 'ENRIQUECIMENTO',
      publico_alvo: 'Alunos com desempenho acima da média',
      descricao: `Criar grupos de estudo avançados e projetos especiais nas disciplinas: ${excellentSubjects.map(s => s.nome).join(', ')}`,
      impacto_esperado: 'Manter engajamento e desenvolver potencial máximo'
    });
  }

  // Monitoria entre pares
  if (classData.taxa_aprovacao < 70) {
    intervencoes.push({
      tipo: 'MONITORIA',
      publico_alvo: 'Alunos com dificuldades e monitores selecionados',
      descricao: 'Implementar programa de monitoria entre pares, onde alunos com bom desempenho auxiliam colegas',
      impacto_esperado: 'Melhoria de 10-15% nas médias dos alunos monitorados'
    });
  }

  return intervencoes;
}

/**
 * Sugere ajustes curriculares
 */
export function suggestCurricularAdjustments(
  subjectAnalyses: SubjectAnalysis[],
  riskStudents: RiskStudent[]
): PedagogicalInsights['ajustes_curriculares'] {
  const ajustes: PedagogicalInsights['ajustes_curriculares'] = [];

  // Disciplinas com desempenho crítico
  const criticalSubjects = subjectAnalyses.filter(s => s.nivel === 'CRÍTICO');
  for (const subject of criticalSubjects) {
    ajustes.push({
      area: subject.nome,
      ajuste: 'Revisar carga horária e sequenciamento de conteúdos',
      justificativa: `Média de ${subject.media.toFixed(1)} indica necessidade de ajuste metodológico`
    });
  }

  // Padrões de dificuldade por área
  const exatas = subjectAnalyses.filter(s => 
    ['Matemática', 'Física', 'Química', 'Ciências'].some(e => s.nome.includes(e))
  );
  const exatasCritical = exatas.filter(s => s.nivel === 'CRÍTICO' || s.nivel === 'ALERTA');

  if (exatasCritical.length >= 2) {
    ajustes.push({
      area: 'Ciências Exatas',
      ajuste: 'Integrar disciplinas exatas através de projetos interdisciplinares',
      justificativa: 'Múltiplas disciplinas com baixo desempenho indicam necessidade de abordagem integrada'
    });
  }

  // Análise de disciplinas correlacionadas
  const mathRelated = subjectAnalyses.filter(s => 
    ['Matemática', 'Física', 'Química'].some(e => s.nome.includes(e))
  );
  if (mathRelated.every(s => s.nivel === 'CRÍTICO' || s.nivel === 'ALERTA')) {
    ajustes.push({
      area: 'Base Matemática',
      ajuste: 'Fortalecer fundamentos matemáticos desde o início do ano letivo',
      justificativa: 'Dificuldades generalizadas em disciplinas que dependem de matemática'
    });
  }

  return ajustes;
}

/**
 * Gera insights pedagógicos completos para uma turma
 */
export function generatePedagogicalInsights(
  classData: ClassData,
  students: StudentData[]
): PedagogicalInsights {
  // Análise de disciplinas
  const subjectAnalyses = Object.entries(classData.medias_disciplina).map(([subject, media]) =>
    analyzeSubject(subject, media, students, classData)
  );

  // Alunos em risco
  const riskStudents = identifyRiskStudents(students, classData);

  // Padrões comportamentais
  const padroesComportamentais = analyzeBehavioralPatterns(classData, subjectAnalyses, students);

  // Recomendações para docentes
  const recomendacoesDocentes = generateTeacherRecommendations(subjectAnalyses, classData);

  // Intervenções pedagógicas
  const intervencoesPedagogicas = proposePedagogicalInterventions(riskStudents, subjectAnalyses, classData);

  // Ajustes curriculares
  const ajustesCurriculares = suggestCurricularAdjustments(subjectAnalyses, riskStudents);

  // Resumo geral
  const pontosFortes: string[] = [];
  const pontosAtencao: string[] = [];

  const excellentSubjects = subjectAnalyses.filter(s => s.nivel === 'EXCELENTE');
  if (excellentSubjects.length > 0) {
    pontosFortes.push(`Desempenho excelente em: ${excellentSubjects.map(s => s.nome).join(', ')}`);
  }

  if (classData.taxa_aprovacao >= 80) {
    pontosFortes.push(`Alta taxa de aprovação (${classData.taxa_aprovacao.toFixed(1)}%)`);
  }

  const criticalSubjects = subjectAnalyses.filter(s => s.nivel === 'CRÍTICO');
  if (criticalSubjects.length > 0) {
    pontosAtencao.push(`Disciplinas críticas: ${criticalSubjects.map(s => s.nome).join(', ')}`);
  }

  if (riskStudents.filter(s => s.nivel_risco === 'ALTO').length > 0) {
    pontosAtencao.push(`${riskStudents.filter(s => s.nivel_risco === 'ALTO').length} alunos em risco alto de reprovação`);
  }

  if (classData.taxa_aprovacao < 60) {
    pontosAtencao.push(`Taxa de aprovação abaixo da meta (${classData.taxa_aprovacao.toFixed(1)}%)`);
  }

  let situacaoTurma: string;
  if (classData.taxa_aprovacao >= 80 && criticalSubjects.length === 0) {
    situacaoTurma = 'Excelente - Turma com desempenho acima da média';
  } else if (classData.taxa_aprovacao >= 60 && criticalSubjects.length <= 1) {
    situacaoTurma = 'Adequada - Turma com desempenho satisfatório, mas com pontos de melhoria';
  } else if (classData.taxa_aprovacao >= 50) {
    situacaoTurma = 'Atenção - Turma necessita de intervenções pedagógicas';
  } else {
    situacaoTurma = 'Crítica - Turma requer ação imediata da coordenação pedagógica';
  }

  return {
    resumo_geral: {
      situacao_turma: situacaoTurma,
      pontos_fortes: pontosFortes,
      pontos_atencao: pontosAtencao
    },
    analise_disciplinas: subjectAnalyses,
    alunos_em_risco: riskStudents,
    padroes_comportamentais: padroesComportamentais,
    recomendacoes_docentes: recomendacoesDocentes,
    intervencoes_pedagogicas: intervencoesPedagogicas,
    ajustes_curriculares: ajustesCurriculares
  };
}

/**
 * Formata insights pedagógicos em texto estruturado
 */
export function formatPedagogicalInsightsAsText(insights: PedagogicalInsights, className: string): string {
  let text = '';

  // Título
  text += `# 📊 Relatório de Insights Pedagógicos - ${className}\n\n`;

  // Resumo Geral
  text += `## 🎯 Resumo Geral\n\n`;
  text += `**Situação da Turma:** ${insights.resumo_geral.situacao_turma}\n\n`;

  if (insights.resumo_geral.pontos_fortes.length > 0) {
    text += `### ✅ Pontos Fortes\n`;
    insights.resumo_geral.pontos_fortes.forEach(ponto => {
      text += `- ${ponto}\n`;
    });
    text += '\n';
  }

  if (insights.resumo_geral.pontos_atencao.length > 0) {
    text += `### ⚠️ Pontos de Atenção\n`;
    insights.resumo_geral.pontos_atencao.forEach(ponto => {
      text += `- ${ponto}\n`;
    });
    text += '\n';
  }

  // Análise de Disciplinas
  text += `## 📚 Análise por Disciplina\n\n`;
  insights.analise_disciplinas.forEach(disciplina => {
    const nivelEmoji = disciplina.nivel === 'CRÍTICO' ? '🔴' : 
                       disciplina.nivel === 'ALERTA' ? '🟡' : 
                       disciplina.nivel === 'ADEQUADO' ? '🟢' : '🌟';
    
    text += `### ${nivelEmoji} ${disciplina.nome}\n`;
    text += `- **Média:** ${disciplina.media.toFixed(1)}\n`;
    text += `- **Nível:** ${disciplina.nivel}\n`;
    text += `- **Alunos abaixo da média:** ${disciplina.alunos_abaixo_media}\n`;
    text += `- **Alunos acima da média:** ${disciplina.alunos_acima_media}\n`;
    
    if (disciplina.gap_genero) {
      text += `- **Gap de gênero:** Masculino ${disciplina.gap_genero.masculino.toFixed(1)} | Feminino ${disciplina.gap_genero.feminino.toFixed(1)} (diferença: ${disciplina.gap_genero.diferenca.toFixed(1)})\n`;
    }
    text += '\n';
  });

  // Alunos em Risco
  if (insights.alunos_em_risco.length > 0) {
    text += `## 🚨 Alunos em Risco (${insights.alunos_em_risco.length})\n\n`;
    insights.alunos_em_risco.slice(0, 10).forEach(aluno => {
      const riscoEmoji = aluno.nivel_risco === 'ALTO' ? '🔴' : aluno.nivel_risco === 'MÉDIO' ? '🟡' : '🟢';
      text += `### ${riscoEmoji} ${aluno.nome}\n`;
      text += `- **Turma:** ${aluno.turma}\n`;
      text += `- **Média Geral:** ${aluno.media_geral.toFixed(1)}\n`;
      text += `- **Disciplinas em risco:** ${aluno.disciplinas_em_risco.join(', ') || 'Nenhuma'}\n`;
      text += `- **Recomendações:**\n`;
      aluno.recomendacoes.forEach(rec => {
        text += `  - ${rec}\n`;
      });
      text += '\n';
    });
    
    if (insights.alunos_em_risco.length > 10) {
      text += `*... e mais ${insights.alunos_em_risco.length - 10} alunos*\n\n`;
    }
  }

  // Padrões Comportamentais
  text += `## 🔍 Padrões Comportamentais\n\n`;
  if (insights.padroes_comportamentais.gap_genero) {
    text += `- **Gap de gênero identificado:** Existem diferenças significativas de desempenho entre gêneros em algumas disciplinas\n`;
  }
  
  if (insights.padroes_comportamentais.correlacao_disciplinas.length > 0) {
    text += `- **Correlações identificadas:**\n`;
    insights.padroes_comportamentais.correlacao_disciplinas.forEach(corr => {
      text += `  - ${corr.disciplina1} ↔ ${corr.disciplina2} (correlação: ${corr.correlacao.toFixed(2)})\n`;
    });
  }
  
  if (insights.padroes_comportamentais.padroes_desempenho.length > 0) {
    text += `- **Padrões de desempenho:**\n`;
    insights.padroes_comportamentais.padroes_desempenho.forEach(padrao => {
      text += `  - ${padrao}\n`;
    });
  }
  text += '\n';

  // Recomendações para Docentes
  text += `## 👨‍🏫 Recomendações para Docentes\n\n`;
  insights.recomendacoes_docentes.forEach(rec => {
    const prioridadeEmoji = rec.prioridade === 'ALTA' ? '🔴' : rec.prioridade === 'MÉDIA' ? '🟡' : '🟢';
    text += `### ${prioridadeEmoji} ${rec.disciplina} (Prioridade: ${rec.prioridade})\n`;
    rec.acoes.forEach(acao => {
      text += `- ${acao}\n`;
    });
    text += '\n';
  });

  // Intervenções Pedagógicas
  if (insights.intervencoes_pedagogicas.length > 0) {
    text += `## 🎓 Intervenções Pedagógicas Sugeridas\n\n`;
    insights.intervencoes_pedagogicas.forEach(intervencao => {
      const tipoEmoji = intervencao.tipo === 'REMEDIAL' ? '🔧' : 
                       intervencao.tipo === 'ENRIQUECIMENTO' ? '🚀' : 
                       intervencao.tipo === 'ADAPTACAO' ? '🔄' : '🤝';
      
      text += `### ${tipoEmoji} ${intervencao.tipo}\n`;
      text += `- **Público-alvo:** ${intervencao.publico_alvo}\n`;
      text += `- **Descrição:** ${intervencao.descricao}\n`;
      text += `- **Impacto esperado:** ${intervencao.impacto_esperado}\n`;
      text += '\n';
    });
  }

  // Ajustes Curriculares
  if (insights.ajustes_curriculares.length > 0) {
    text += `## 📝 Ajustes Curriculares Sugeridos\n\n`;
    insights.ajustes_curriculares.forEach(ajuste => {
      text += `### ${ajuste.area}\n`;
      text += `- **Ajuste:** ${ajuste.ajuste}\n`;
      text += `- **Justificativa:** ${ajuste.justificativa}\n`;
      text += '\n';
    });
  }

  return text;
}

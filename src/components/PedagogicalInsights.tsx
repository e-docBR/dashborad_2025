'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen,
  Target,
  Lightbulb,
  AlertCircle,
  GraduationCap,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubjectAnalysis {
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

interface RiskStudent {
  nome: string
  turma: string
  nivel_risco: 'ALTO' | 'MÉDIO' | 'BAIXO'
  disciplinas_em_risco: string[]
  media_geral: number
  recomendacoes: string[]
}

interface PedagogicalInsightsData {
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

interface PedagogicalInsightsProps {
  insights: PedagogicalInsightsData
  className?: string
}

export function PedagogicalInsights({ insights, className }: PedagogicalInsightsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    resumo: true,
    disciplinas: true,
    risco: true,
    recomendacoes: true,
    intervencoes: false,
    curriculo: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'CRÍTICO': return 'text-red-600 bg-red-50 border-red-200'
      case 'ALERTA': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'ADEQUADO': return 'text-green-600 bg-green-50 border-green-200'
      case 'EXCELENTE': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'ALTA': return 'bg-red-100 text-red-700 border-red-300'
      case 'MÉDIA': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'BAIXA': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getRiscoIcon = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'MÉDIO': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'BAIXO': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      default: return null
    }
  }

  const getIntervencaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'REMEDIAL': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'ENRIQUECIMENTO': return <TrendingUp className="h-5 w-5 text-emerald-600" />
      case 'ADAPTACAO': return <Activity className="h-5 w-5 text-blue-600" />
      case 'MONITORIA': return <Users className="h-5 w-5 text-purple-600" />
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Resumo Geral */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('resumo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <CardTitle>Resumo Geral</CardTitle>
            </div>
            {expandedSections.resumo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Análise consolidada do desempenho da turma</CardDescription>
        </CardHeader>
        {expandedSections.resumo && (
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200">
              <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                {insights.resumo_geral.situacao_turma}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-1">
                  {insights.resumo_geral.pontos_fortes.map((ponto, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      {ponto}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Pontos de Atenção
                </h4>
                <ul className="space-y-1">
                  {insights.resumo_geral.pontos_atencao.map((ponto, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      {ponto}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Análise de Disciplinas */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('disciplinas')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <CardTitle>Análise por Disciplina</CardTitle>
            </div>
            {expandedSections.disciplinas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Desempenho detalhado por área de conhecimento</CardDescription>
        </CardHeader>
        {expandedSections.disciplinas && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.analise_disciplinas.map((disciplina, idx) => (
                <Card key={idx} className="border-l-4" style={{
                  borderLeftColor: disciplina.nivel === 'CRÍTICO' ? '#ef4444' :
                                 disciplina.nivel === 'ALERTA' ? '#f59e0b' :
                                 disciplina.nivel === 'ADEQUADO' ? '#22c55e' : '#10b981'
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{disciplina.nome}</CardTitle>
                      <Badge className={getNivelColor(disciplina.nivel)}>
                        {disciplina.nivel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Média:</span>
                      <span className="font-semibold">{disciplina.media.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Abaixo da média:</span>
                      <span className="text-red-600">{disciplina.alunos_abaixo_media}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Acima da média:</span>
                      <span className="text-green-600">{disciplina.alunos_acima_media}</span>
                    </div>
                    {disciplina.gap_genero && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Gap de Gênero:</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">M: {disciplina.gap_genero.masculino.toFixed(1)}</span>
                          <span className="text-pink-600">F: {disciplina.gap_genero.feminino.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Alunos em Risco */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('risco')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle>Alunos em Risco</CardTitle>
              <Badge variant="destructive">{insights.alunos_em_risco.length}</Badge>
            </div>
            {expandedSections.risco ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Identificação e intervenções para alunos com dificuldades</CardDescription>
        </CardHeader>
        {expandedSections.risco && (
          <CardContent>
            {insights.alunos_em_risco.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>Nenhum aluno em risco identificado</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {insights.alunos_em_risco.map((aluno, idx) => (
                    <Card key={idx} className="border-l-4" style={{
                      borderLeftColor: aluno.nivel_risco === 'ALTO' ? '#ef4444' :
                                     aluno.nivel_risco === 'MÉDIO' ? '#f59e0b' : '#22c55e'
                    }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getRiscoIcon(aluno.nivel_risco)}
                            <h4 className="font-semibold">{aluno.nome}</h4>
                          </div>
                          <Badge className={getNivelColor(aluno.nivel_risco)}>
                            {aluno.nivel_risco}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Turma:</span>
                            <span className="ml-1 font-medium">{aluno.turma}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Média:</span>
                            <span className="ml-1 font-medium">{aluno.media_geral.toFixed(1)}</span>
                          </div>
                        </div>
                        {aluno.disciplinas_em_risco.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Disciplinas em risco:</p>
                            <div className="flex flex-wrap gap-1">
                              {aluno.disciplinas_em_risco.map((disc, dIdx) => (
                                <Badge key={dIdx} variant="outline" className="text-xs">
                                  {disc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Recomendações:</p>
                          <ul className="space-y-1">
                            {aluno.recomendacoes.map((rec, rIdx) => (
                              <li key={rIdx} className="text-xs flex items-start gap-1">
                                <span className="text-indigo-600">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recomendações para Docentes */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('recomendacoes')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <CardTitle>Recomendações para Docentes</CardTitle>
            </div>
            {expandedSections.recomendacoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Ações pedagógicas específicas por disciplina</CardDescription>
        </CardHeader>
        {expandedSections.recomendacoes && (
          <CardContent>
            <div className="space-y-4">
              {insights.recomendacoes_docentes.map((rec, idx) => (
                <Card key={idx} className="border-l-4 border-indigo-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{rec.disciplina}</CardTitle>
                      <Badge className={getPrioridadeColor(rec.prioridade)}>
                        {rec.prioridade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {rec.acoes.map((acao, aIdx) => (
                        <li key={aIdx} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {acao}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Intervenções Pedagógicas */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('intervencoes')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <CardTitle>Intervenções Pedagógicas</CardTitle>
            </div>
            {expandedSections.intervencoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Estratégias estruturadas para melhoria do aprendizado</CardDescription>
        </CardHeader>
        {expandedSections.intervencoes && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.intervencoes_pedagogicas.map((intervencao, idx) => (
                <Card key={idx} className="border-l-4 border-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getIntervencaoIcon(intervencao.tipo)}
                      <CardTitle className="text-base">{intervencao.tipo}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Público-alvo:</p>
                      <p className="text-sm font-medium">{intervencao.publico_alvo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Descrição:</p>
                      <p className="text-sm">{intervencao.descricao}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Impacto esperado:</p>
                      <p className="text-sm text-green-600 font-medium">{intervencao.impacto_esperado}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Ajustes Curriculares */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('curriculo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <CardTitle>Ajustes Curriculares</CardTitle>
            </div>
            {expandedSections.curriculo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          <CardDescription>Sugestões de adaptação do currículo escolar</CardDescription>
        </CardHeader>
        {expandedSections.curriculo && (
          <CardContent>
            {insights.ajustes_curriculares.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p>Nenhum ajuste curricular necessário</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.ajustes_curriculares.map((ajuste, idx) => (
                  <Card key={idx} className="border-l-4 border-blue-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">{ajuste.area}</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Ajuste:</p>
                          <p className="text-sm">{ajuste.ajuste}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Justificativa:</p>
                          <p className="text-sm text-muted-foreground">{ajuste.justificativa}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

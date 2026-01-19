'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PedagogicalInsights } from '@/components/PedagogicalInsights'
import { getPedagogicalInsights, getAllClassesRiskSummary } from '@/app/actions/pedagogical-insights'
import { toast } from 'sonner'
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  BookOpen,
  Loader2,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ClassSummary {
  turma: string
  taxa_aprovacao: number
  alunos_em_risco: number
  disciplinas_criticas: number
  situacao: string
}

export default function PedagogicalInsightsPage() {
  const router = useRouter()
  const [selectedTurma, setSelectedTurma] = useState<string>('')
  const [insights, setInsights] = useState<any>(null)
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    loadClassSummaries()
  }, [])

  const loadClassSummaries = async () => {
    setLoadingSummary(true)
    try {
      const result = await getAllClassesRiskSummary()
      if (result.success) {
        setClassSummaries(result.data)
      } else {
        toast.error(result.error || 'Erro ao carregar resumo das turmas')
      }
    } catch (error) {
      toast.error('Erro ao carregar resumo das turmas')
    } finally {
      setLoadingSummary(false)
    }
  }

  const loadInsights = async (turma: string) => {
    if (!turma) return

    setLoading(true)
    setInsights(null)

    try {
      const result = await getPedagogicalInsights(turma)
      if (result.success) {
        setInsights(result.data)
      } else {
        toast.error(result.error || 'Erro ao carregar insights')
      }
    } catch (error) {
      toast.error('Erro ao carregar insights')
    } finally {
      setLoading(false)
    }
  }

  const handleTurmaChange = (turma: string) => {
    setSelectedTurma(turma)
    if (turma !== 'all') {
      loadInsights(turma)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getTurmaStatusColor = (situacao: string) => {
    if (situacao.includes('Excelente')) return 'bg-green-100 text-green-700 border-green-300'
    if (situacao.includes('Adequada')) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (situacao.includes('Atenção')) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    if (situacao.includes('Crítica')) return 'bg-red-100 text-red-700 border-red-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="touch-target"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
                Insights Pedagógicos
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                Análise avançada de desempenho e recomendações pedagógicas
              </p>
            </div>
            {insights && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="touch-target"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Imprimir</span>
                  <span className="sm:hidden">Imprimir</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Class Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Selecionar Turma</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Escolha uma turma para visualizar insights detalhados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTurma} onValueChange={handleTurmaChange}>
              <SelectTrigger className="min-h-10">
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Turmas (Visão Geral)</SelectItem>
                {classSummaries.map((summary) => (
                  <SelectItem key={summary.turma} value={summary.turma}>
                    {summary.turma} - {summary.taxa_aprovacao.toFixed(1)}% aprovação
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Class Summary Cards */}
        {selectedTurma === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {loadingSummary ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              classSummaries.map((summary) => (
                <Card
                  key={summary.turma}
                  className="cursor-pointer hover:shadow-lg transition-all border-l-4"
                  style={{
                    borderLeftColor: summary.taxa_aprovacao >= 80 ? '#22c55e' :
                                   summary.taxa_aprovacao >= 60 ? '#3b82f6' :
                                   summary.taxa_aprovacao >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                  onClick={() => handleTurmaChange(summary.turma)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{summary.turma}</CardTitle>
                      <Badge className={getTurmaStatusColor(summary.situacao)}>
                        {summary.taxa_aprovacao >= 80 ? 'Excelente' :
                         summary.taxa_aprovacao >= 60 ? 'Adequada' :
                         summary.taxa_aprovacao >= 50 ? 'Atenção' : 'Crítica'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de Aprovação:</span>
                        <span className="font-semibold">{summary.taxa_aprovacao.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Alunos em Risco:
                        </span>
                        <span className="font-semibold text-red-600">{summary.alunos_em_risco}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Disciplinas Críticas:
                        </span>
                        <span className="font-semibold text-orange-600">{summary.disciplinas_criticas}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Insights Display */}
        {selectedTurma !== 'all' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : insights ? (
              <PedagogicalInsights insights={insights} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecione uma turma para visualizar os insights pedagógicos
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Global Statistics */}
        {selectedTurma === 'all' && !loadingSummary && classSummaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Estatísticas Globais</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Visão consolidada de todas as turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {classSummaries.length}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Turmas</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {(classSummaries.reduce((sum, s) => sum + s.taxa_aprovacao, 0) / classSummaries.length).toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">Média Aprovação</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {classSummaries.reduce((sum, s) => sum + s.alunos_em_risco, 0)}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">Alunos em Risco</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {classSummaries.reduce((sum, s) => sum + s.disciplinas_criticas, 0)}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Disciplinas Críticas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

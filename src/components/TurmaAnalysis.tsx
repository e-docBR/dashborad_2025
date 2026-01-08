'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

interface ClassStats {
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

interface DashboardData {
  resumo_geral: {
    total_alunos: number
    total_aprovados: number
    total_reprovados: number
    taxa_aprovacao_global: number
    total_masculino: number
    total_feminino: number
    medias_gerais_disciplina: Record<string, number>
    turmas_matutino: number
    turmas_vespertino: number
  }
  estatisticas_por_turma: Record<string, ClassStats>
  alunos: any[]
}

interface TurmaAnalysisProps {
  data: DashboardData
  onMenuChange: (menu: string) => void
}

import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { getClassInsights } from '@/app/actions/ai-insights'
import { toast } from 'sonner'

export default function TurmaAnalysis({ data, onMenuChange }: TurmaAnalysisProps) {
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [insights, setInsights] = useState<string | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  // Reset insights when class changes
  useEffect(() => {
    setInsights(null)
  }, [selectedTurma])

  const handleGenerateInsights = async () => {
    if (selectedTurma === 'all') {
      toast.error("Selecione uma turma específica para gerar insights.")
      return;
    }
    setLoadingInsights(true);
    setInsights(null);

    const result = await getClassInsights(selectedTurma);
    if (result.success) {
      setInsights(result.text);
    } else {
      toast.error(result.text);
    }
    setLoadingInsights(false);
  };

  const filteredStats = Object.entries(data.estatisticas_por_turma).filter(([_, stat]) => {
    const turnoMatch = selectedTurno === 'all' || stat.turno === selectedTurno
    const turmaMatch = selectedTurma === 'all' || stat.turma === selectedTurma
    return turnoMatch && turmaMatch
  })

  const turmasData = filteredStats.map(([_, stat]) => ({
    turma: stat.turma,
    aprovados: stat.aprovados,
    reprovados: stat.reprovados,
    apcc: stat.apcc,
    transferidos: stat.transferidos,
    desistentes: stat.desistentes,
    cancelados: stat.cancelados,
    taxa_aprovacao: stat.taxa_aprovacao,
    total: stat.total_alunos
  }))

  const selectedClassData = selectedTurma !== 'all'
    ? data.estatisticas_por_turma[Object.keys(data.estatisticas_por_turma).find(
      key => data.estatisticas_por_turma[key].turma === selectedTurma
    ) || '']
    : null

  const radarData = selectedClassData
    ? Object.entries(selectedClassData.medias_disciplina).map(([disciplina, media]) => ({
      subject: disciplina,
      media: media
    }))
    : Object.entries(data.resumo_geral.medias_gerais_disciplina).map(([disciplina, media]) => ({
      subject: disciplina,
      media: media
    }))

  return (
    <div className="space-y-6">

      {/* AI Insights Card */}
      <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Insights Pedagógicos (IA)
            </CardTitle>
            <CardDescription>
              Análise automatizada de desempenho e sugestões pedagógicas.
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={loadingInsights || selectedTurma === 'all'}
            variant="outline"
            className="bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {loadingInsights ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Análise
              </>
            )}
          </Button>
        </CardHeader>
        {insights && (
          <CardContent>
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-lg border border-indigo-100/50 shadow-sm">
              <pre className="whitespace-pre-wrap font-sans">{insights}</pre>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análise</CardTitle>
          <CardDescription>Selecione os critérios para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Turno</label>
              <Select value={selectedTurno} onValueChange={setSelectedTurno}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Turnos</SelectItem>
                  <SelectItem value="MATUTINO">Matutino</SelectItem>
                  <SelectItem value="VESPERTINO">Vespertino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Turmas</SelectItem>
                  {Object.values(data.estatisticas_por_turma)
                    .filter(stat => selectedTurno === 'all' || stat.turno === selectedTurno)
                    .map((stat) => (
                      <SelectItem key={stat.turma} value={stat.turma}>
                        {stat.turma} - {stat.turno}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredStats.map(([_, stat]) => (
          <Card
            key={stat.turma}
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedTurma === stat.turma ? 'ring-2 ring-primary' : ''
              }`}
            onClick={() => setSelectedTurma(stat.turma)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{stat.turma}</CardTitle>
                <Badge variant={stat.turno === 'MATUTINO' ? 'default' : 'secondary'}>
                  {stat.turno}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{stat.total_alunos}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aprovados:</span>
                  <span className="font-medium text-green-600">{stat.aprovados}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reprovados:</span>
                  <span className="font-medium text-red-600">{stat.reprovados}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa Aprovação:</span>
                  <span className={`font-medium ${stat.taxa_aprovacao >= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {stat.taxa_aprovacao}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Resultados</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={turmasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="aprovados" name="Aprovados" fill="#22c55e" />
                <Bar dataKey="reprovados" name="Reprovados" fill="#ef4444" />
                <Bar dataKey="apcc" name="APCC" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outros Status</CardTitle>
            <CardDescription>Transferidos, Desistentes e Cancelados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={turmasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="transferidos" name="Transferidos" fill="#3b82f6" />
                <Bar dataKey="desistentes" name="Desistentes" fill="#8b5cf6" />
                <Bar dataKey="cancelados" name="Cancelados" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Aprovação por Turma</CardTitle>
          <CardDescription>Comparativo percentual</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={turmasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar
                dataKey="taxa_aprovacao"
                name="Taxa de Aprovação (%)"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detalhes da Turma Selecionada */}
      {selectedClassData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>{selectedClassData.turma}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Média"
                    dataKey="media"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Gênero</CardTitle>
              <CardDescription>{selectedClassData.turma}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Masculino</span>
                    <Badge variant="outline">{selectedClassData.masculino} alunos</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${(selectedClassData.masculino / selectedClassData.total_alunos) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((selectedClassData.masculino / selectedClassData.total_alunos) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Feminino</span>
                    <Badge variant="outline">{selectedClassData.feminino} alunos</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-pink-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${(selectedClassData.feminino / selectedClassData.total_alunos) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((selectedClassData.feminino / selectedClassData.total_alunos) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Total de Alunos</TableCell>
                        <TableCell className="text-right">{selectedClassData.total_alunos}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-green-600">Aprovados</TableCell>
                        <TableCell className="text-right">{selectedClassData.aprovados}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-red-600">Reprovados</TableCell>
                        <TableCell className="text-right">{selectedClassData.reprovados}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-yellow-600">APCC</TableCell>
                        <TableCell className="text-right">{selectedClassData.apcc}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Taxa de Aprovação</TableCell>
                        <TableCell className="text-right font-bold">{selectedClassData.taxa_aprovacao}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela Detalhada de Médias por Turma */}
      <Card>
        <CardHeader>
          <CardTitle>Médias por Disciplina - Todas as Turmas</CardTitle>
          <CardDescription>Comparativo detalhado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Total</TableHead>
                  {Object.keys(data.resumo_geral.medias_gerais_disciplina).map((disc) => (
                    <TableHead key={disc} className="text-right">{disc}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.map(([_, stat]) => (
                  <TableRow key={stat.turma}>
                    <TableCell className="font-medium">{stat.turma}</TableCell>
                    <TableCell>
                      <Badge variant={stat.turno === 'MATUTINO' ? 'default' : 'secondary'}>
                        {stat.turno}
                      </Badge>
                    </TableCell>
                    <TableCell>{stat.total_alunos}</TableCell>
                    {Object.keys(data.resumo_geral.medias_gerais_disciplina).map((disc) => (
                      <TableCell key={disc} className="text-right">
                        <span className={
                          stat.medias_disciplina[disc] >= 60 ? 'text-green-600' :
                            stat.medias_disciplina[disc] >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                        }>
                          {stat.medias_disciplina[disc]?.toFixed(1) || '--'}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

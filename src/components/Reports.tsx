'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Download, 
  Filter,
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRightLeft,
  LogOut,
  MinusCircle
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']

interface ReportsProps {
  data: DashboardData
  onMenuChange: (menu: string) => void
}

export default function Reports({ data, onMenuChange }: ReportsProps) {
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [reportType, setReportType] = useState<string>('geral')

  const filteredStats = Object.entries(data.estatisticas_por_turma).filter(([_, stat]) => {
    const turnoMatch = selectedTurno === 'all' || stat.turno === selectedTurno
    const turmaMatch = selectedTurma === 'all' || stat.turma === selectedTurma
    return turnoMatch && turmaMatch
  })

  const totalFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.total_alunos, 0)
  const aprovadosFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.aprovados, 0)
  const reprovadosFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.reprovados, 0)
  const apccFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.apcc, 0)
  const transferidosFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.transferidos, 0)
  const desistentesFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.desistentes, 0)
  const canceladosFiltrado = filteredStats.reduce((acc, [_, stat]) => acc + stat.cancelados, 0)

  const resultadoData = [
    { name: 'Aprovados', value: aprovadosFiltrado, icon: CheckCircle, color: COLORS[0] },
    { name: 'Reprovados', value: reprovadosFiltrado, icon: XCircle, color: COLORS[1] },
    { name: 'APCC', value: apccFiltrado, icon: AlertCircle, color: COLORS[2] },
    { name: 'Transferidos', value: transferidosFiltrado, icon: ArrowRightLeft, color: COLORS[3] },
    { name: 'Desistentes', value: desistentesFiltrado, icon: LogOut, color: COLORS[4] },
    { name: 'Cancelados', value: canceladosFiltrado, icon: MinusCircle, color: COLORS[5] },
  ]

  const disciplinasData = Object.entries(data.resumo_geral.medias_gerais_disciplina).map(([disc, media]) => ({
    disciplina: disc,
    media: media,
    status: media >= 60 ? 'Bom' : media >= 50 ? 'Regular' : 'Crítico'
  }))

  const handleExport = () => {
    const reportData = {
      filtros: {
        turno: selectedTurno === 'all' ? 'Todos' : selectedTurno,
        turma: selectedTurma === 'all' ? 'Todas' : selectedTurma
      },
      resumo: {
        total_alunos: totalFiltrado,
        aprovados: aprovadosFiltrado,
        reprovados: reprovadosFiltrado,
        apcc: apccFiltrado,
        transferidos: transferidosFiltrado,
        desistentes: desistentesFiltrado,
        cancelados: canceladosFiltrado,
        taxa_aprovacao: totalFiltrado > 0 ? ((aprovadosFiltrado / totalFiltrado) * 100).toFixed(2) : 0
      },
      turmas: filteredStats.map(([_, stat]) => ({
        turma: stat.turma,
        turno: stat.turno,
        total_alunos: stat.total_alunos,
        aprovados: stat.aprovados,
        reprovados: stat.reprovados,
        apcc: stat.apcc,
        transferidos: stat.transferidos,
        desistentes: stat.desistentes,
        cancelados: stat.cancelados,
        taxa_aprovacao: stat.taxa_aprovacao,
        medias_disciplina: stat.medias_disciplina
      }))
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-escolar-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros e Exportação */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Relatórios Detalhados</CardTitle>
              <CardDescription>Análises completas e exportação de dados</CardDescription>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                  <SelectItem value="aprovacao">Taxa de Aprovação</SelectItem>
                  <SelectItem value="desempenho">Desempenho por Disciplina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Turno</label>
              <Select value={selectedTurno} onValueChange={setSelectedTurno}>
                <SelectTrigger>
                  <SelectValue />
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
                  <SelectValue />
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

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {resultadoData.map((item) => (
          <Card key={item.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <item.icon className={`w-5 h-5 text-${item.color.split('-')[1]}-600`} style={{ color: item.color }} />
                <Badge variant="outline">{item.name}</Badge>
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((item.value / totalFiltrado) * 100).toFixed(1)}% do total
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos do Relatório */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Resultados</CardTitle>
            <CardDescription>Visão geral dos resultados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resultadoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Desempenho</CardTitle>
            <CardDescription>Métricas principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de Aprovação</span>
                  <Badge 
                    variant={((aprovadosFiltrado / totalFiltrado) * 100) >= 60 ? 'default' : 'destructive'}
                  >
                    {totalFiltrado > 0 ? ((aprovadosFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 mt-2">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${totalFiltrado > 0 ? (aprovadosFiltrado / totalFiltrado) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de Reprovação</span>
                  <Badge variant="destructive">
                    {totalFiltrado > 0 ? ((reprovadosFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 mt-2">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${totalFiltrado > 0 ? (reprovadosFiltrado / totalFiltrado) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de Retenção (APCC)</span>
                  <Badge variant="secondary">
                    {totalFiltrado > 0 ? ((apccFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 mt-2">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ 
                      width: `${totalFiltrado > 0 ? (apccFiltrado / totalFiltrado) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total da Amostra</span>
                  <Badge variant="outline">{totalFiltrado} alunos</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório por Disciplina */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Disciplina</CardTitle>
          <CardDescription>Análise detalhada de médias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={disciplinasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="disciplina" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada por Turma */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Turma</CardTitle>
          <CardDescription>Detalhamento completo por turma selecionada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Aprovados</TableHead>
                  <TableHead>Reprovados</TableHead>
                  <TableHead>APCC</TableHead>
                  <TableHead>Transferidos</TableHead>
                  <TableHead>Desistentes</TableHead>
                  <TableHead>Cancelados</TableHead>
                  <TableHead className="text-right">Taxa (%)</TableHead>
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
                    <TableCell className="text-green-600">{stat.aprovados}</TableCell>
                    <TableCell className="text-red-600">{stat.reprovados}</TableCell>
                    <TableCell className="text-yellow-600">{stat.apcc}</TableCell>
                    <TableCell className="text-blue-600">{stat.transferidos}</TableCell>
                    <TableCell className="text-purple-600">{stat.desistentes}</TableCell>
                    <TableCell className="text-pink-600">{stat.cancelados}</TableCell>
                    <TableCell className="text-right font-bold">
                      {stat.taxa_aprovacao.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Observações e Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights do Relatório</CardTitle>
          <CardDescription>Análise automática dos dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <Users className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Amostra Analisada</p>
                <p className="text-sm text-muted-foreground">
                  O relatório abrange {totalFiltrado} alunos de {filteredStats.length} turma(s) do turno{' '}
                  {selectedTurno === 'all' ? 'matutino e vespertino' : selectedTurno.toLowerCase()}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Desempenho Geral</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  A taxa de aprovação é de {totalFiltrado > 0 ? ((aprovadosFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%.
                  {totalFiltrado > 0 && ((aprovadosFiltrado / totalFiltrado) * 100) >= 60 
                    ? ' Este valor está acima da meta de 60%.'
                    : ' Este valor está abaixo da meta de 60%.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
              <XCircle className="w-5 h-5 mt-0.5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Atenção Necessária</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {reprovadosFiltrado} alunos foram reprovados ({totalFiltrado > 0 ? ((reprovadosFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%).
                  É recomendado investigar as causas e implementar ações de apoio pedagógico.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="w-5 h-5 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">APCC - Atenção</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {apccFiltrado} alunos estão em APCC ({totalFiltrado > 0 ? ((apccFiltrado / totalFiltrado) * 100).toFixed(1) : 0}%),
                  necessitando acompanhamento especializado para recuperação.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

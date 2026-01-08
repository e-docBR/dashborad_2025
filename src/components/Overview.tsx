'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  GraduationCap,
  Calendar
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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

interface OverviewProps {
  data: DashboardData
  onMenuChange: (menu: string) => void
}

export default function Overview({ data, onMenuChange }: OverviewProps) {
  const resultadoFinalData = [
    { name: 'Aprovados', value: data.resumo_geral.total_aprovados },
    { name: 'Reprovados', value: data.resumo_geral.total_reprovados },
    { name: 'APCC', value: Object.values(data.estatisticas_por_turma).reduce((acc, s) => acc + s.apcc, 0) },
    { name: 'Transferidos', value: Object.values(data.estatisticas_por_turma).reduce((acc, s) => acc + s.transferidos, 0) },
    { name: 'Desistentes', value: Object.values(data.estatisticas_por_turma).reduce((acc, s) => acc + s.desistentes, 0) },
    { name: 'Cancelados', value: Object.values(data.estatisticas_por_turma).reduce((acc, s) => acc + s.cancelados, 0) },
  ]

  const genderData = [
    { name: 'Masculino', value: data.resumo_geral.total_masculino },
    { name: 'Feminino', value: data.resumo_geral.total_feminino },
  ]

  const subjectsData = Object.entries(data.resumo_geral.medias_gerais_disciplina).map(([subject, avg]) => ({
    disciplina: subject,
    media: avg
  }))

  const turmasData = Object.values(data.estatisticas_por_turma).map(stat => ({
    turma: stat.turma,
    aprovados: stat.aprovados,
    reprovados: stat.reprovados,
    taxa_aprovacao: stat.taxa_aprovacao
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total de Alunos</CardDescription>
            <CardTitle className="text-3xl">{data.resumo_geral.total_alunos}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{data.resumo_geral.total_masculino} masculino, {data.resumo_geral.total_feminino} feminino</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Aprovação</CardDescription>
            <CardTitle className="text-3xl">{data.resumo_geral.taxa_aprovacao_global}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>{data.resumo_geral.total_aprovados} alunos aprovados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Reprovação</CardDescription>
            <CardTitle className="text-3xl">
              {((data.resumo_geral.total_reprovados / data.resumo_geral.total_alunos) * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>{data.resumo_geral.total_reprovados} alunos reprovados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription>Total de Turmas</CardDescription>
            <CardTitle className="text-3xl">{Object.keys(data.estatisticas_por_turma).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{data.resumo_geral.turmas_matutino} matutino, {data.resumo_geral.turmas_vespertino} vespertino</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resultados Finais</CardTitle>
            <CardDescription>Distribuição geral de resultados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resultadoFinalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultadoFinalData.map((entry, index) => (
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
            <CardTitle>Distribuição por Gênero</CardTitle>
            <CardDescription>Alunos por gênero</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Média Geral por Disciplina</CardTitle>
            <CardDescription>Desempenho médio dos alunos em cada disciplina</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disciplina" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido por Turma */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Turma</CardTitle>
          <CardDescription>Visão geral do desempenho por turma</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={turmasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="aprovados" name="Aprovados" fill="#22c55e" />
              <Bar dataKey="reprovados" name="Reprovados" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Período Letivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Ano Letivo</p>
              <p className="text-2xl font-bold">2025</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Série</p>
              <p className="text-2xl font-bold">6º Ano Fundamental</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Escola</p>
              <p className="text-lg font-bold">Colégio Municipal de 1º e 2º Graus de Itabatan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

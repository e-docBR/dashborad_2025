'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, AlertCircle, TrendingDown, Users, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

interface Student {
    nome: string
    turma: string
    turno: string
    notas: Record<string, number>
    media_geral: number | null
    resultado_final: string
}

interface ClassStats {
    turma: string
    reprovados: number
    total_alunos: number
    apcc: number
}

interface DashboardData {
    estatisticas_por_turma: Record<string, ClassStats>
    alunos: Student[]
}

interface RiskAnalysisProps {
    data: DashboardData
    onMenuChange: (menu: string) => void
}

export default function RiskAnalysis({ data }: RiskAnalysisProps) {
    const [selectedTurma, setSelectedTurma] = useState<string>('all')
    const [minReprovacoes, setMinReprovacoes] = useState<string>('3')
    const [searchTerm, setSearchTerm] = useState('')

    // 1. Identificar alunos em risco
    // Filtrar alunos ativos (excluir transferidos/cancelados/desistentes)
    const activeStudents = data.alunos.filter(s =>
        !['TRANSFERIDO', 'CANCELADO', 'DESISTENTE'].includes(s.resultado_final)
    )

    const studentsAtRisk = activeStudents.map(student => {
        // Conta quantas disciplinas estão abaixo de 60
        const failedSubjects = Object.entries(student.notas).filter(([_, score]) => score < 60)
        return {
            ...student,
            failedCount: failedSubjects.length,
            failedSubjects: failedSubjects.map(([subject, score]) => `${subject} (${score.toFixed(1)})`)
        }
    }).filter(student => {
        // Filtro base: Pelo menos 1 reprovação ou Média Geral crítica
        return student.failedCount > 0 || (student.media_geral && student.media_geral < 60)
    })

    // 2. Aplicarfiltros visuais
    const filteredRiskStudents = studentsAtRisk.filter(student => {
        const turmaMatch = selectedTurma === 'all' || student.turma === selectedTurma
        const riskLevelMatch = student.failedCount >= parseInt(minReprovacoes)
        const searchMatch = student.nome.toLowerCase().includes(searchTerm.toLowerCase())
        return turmaMatch && riskLevelMatch && searchMatch
    }).sort((a, b) => b.failedCount - a.failedCount) // Ordenar por gravidade

    // 3. Estatísticas para Gráficos
    const riskByClass = Object.values(data.estatisticas_por_turma).map(stat => {
        // Calcular quantos alunos desta turma estão na lista de alunos em risco (critério > 0 reprovações)
        const count = studentsAtRisk.filter(s => s.turma === stat.turma && s.failedCount >= 3).length
        return {
            turma: stat.turma,
            highRiskCount: count
        }
    }).sort((a, b) => b.highRiskCount - a.highRiskCount)

    // KPIs
    const criticalRiskCount = studentsAtRisk.filter(s => s.failedCount >= 3).length
    const moderateRiskCount = studentsAtRisk.filter(s => s.failedCount >= 1 && s.failedCount < 3).length
    const lowAvgCount = studentsAtRisk.filter(s => s.failedCount === 0 && s.media_geral && s.media_geral < 60).length

    return (
        <div className="space-y-6">

            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-red-600 bg-red-50/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Risco Crítico
                        </CardTitle>
                        <CardDescription>3+ disciplinas abaixo da média</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-800">{criticalRiskCount}</div>
                        <p className="text-xs text-red-600 mt-1">Alunos precisando intervenção urgente</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 bg-orange-50/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-orange-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Risco Moderado
                        </CardTitle>
                        <CardDescription>1 ou 2 disciplinas abaixo da média</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-800">{moderateRiskCount}</div>
                        <p className="text-xs text-orange-600 mt-1">Alunos em atenção</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-yellow-700 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Média Global Baixa
                        </CardTitle>
                        <CardDescription>Sem reprovações, mas média {'<'} 60</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-800">{lowAvgCount}</div>
                        <p className="text-xs text-yellow-600 mt-1">Alunos em declínio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Distribuição de Risco por Turma */}
            <Card>
                <CardHeader>
                    <CardTitle>Alunos em Risco Crítico por Turma</CardTitle>
                    <CardDescription>Quantidade de alunos com 3+ reprovações por turma</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={riskByClass}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="turma" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="highRiskCount" name="Alunos em Risco Crítico" fill="#dc2626" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Tabela de Detalhamento */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Alunos em Foco</CardTitle>
                            <CardDescription>Lista prioritária para intervenção pedagógica</CardDescription>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Filtro de Busca */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar aluno..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filtro de Turma */}
                            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filtrar Turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Turmas</SelectItem>
                                    {Object.keys(data.estatisticas_por_turma).map(turma => (
                                        <SelectItem key={turma} value={data.estatisticas_por_turma[turma].turma}>
                                            {data.estatisticas_por_turma[turma].turma}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Filtro de Gravidade */}
                            <Select value={minReprovacoes} onValueChange={setMinReprovacoes}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Gravidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1+ Disciplinas (Todos)</SelectItem>
                                    <SelectItem value="3">3+ Disciplinas (Crítico)</SelectItem>
                                    <SelectItem value="5">5+ Disciplinas (Grave)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[600px] overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Turma</TableHead>
                                    <TableHead>Disciplinas Abaixo da Média</TableHead>
                                    <TableHead className="text-center">Qtd.</TableHead>
                                    <TableHead className="text-right">Média Geral</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRiskStudents.map((student, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                {student.nome}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{student.turma}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.failedSubjects.map((sub, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                                                        {sub}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={student.failedCount >= 3 ? 'destructive' : 'default'} className={student.failedCount < 3 ? 'bg-orange-500' : ''}>
                                                {student.failedCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-700">
                                            {student.media_geral?.toFixed(1) || '--'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRiskStudents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum aluno encontrado com os critérios selecionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

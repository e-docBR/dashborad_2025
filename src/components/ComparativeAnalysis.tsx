'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
    Cell
} from 'recharts'
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'

interface ClassStats {
    turma: string
    taxa_aprovacao: number
    medias_disciplina: Record<string, number>
    total_alunos: number
}

interface DashboardData {
    estatisticas_por_turma: Record<string, ClassStats>
    resumo_geral: {
        medias_gerais_disciplina: Record<string, number>
    }
}

interface ComparativeAnalysisProps {
    data: DashboardData
    onMenuChange: (menu: string) => void
}

export default function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
    const [turmaA, setTurmaA] = useState<string>('all') // 'all' = Média da Escola
    const [turmaB, setTurmaB] = useState<string>(Object.values(data.estatisticas_por_turma)[0]?.turma || 'all')

    const getStats = (turmaId: string) => {
        if (turmaId === 'all') {
            return {
                turma: 'Média da Escola',
                taxa_aprovacao: Object.values(data.estatisticas_por_turma).reduce((acc, curr) => acc + curr.taxa_aprovacao, 0) / Object.keys(data.estatisticas_por_turma).length,
                medias_disciplina: data.resumo_geral.medias_gerais_disciplina,
                total_alunos: 0 // Irrelevante para média
            }
        }
        return Object.values(data.estatisticas_por_turma).find(t => t.turma === turmaId)
    }

    const statsA = getStats(turmaA)
    const statsB = getStats(turmaB)

    if (!statsA || !statsB) return null

    // Preparar dados para o Radar Chart
    const allSubjects = Array.from(new Set([
        ...Object.keys(statsA.medias_disciplina),
        ...Object.keys(statsB.medias_disciplina)
    ]))

    const radarData = allSubjects.map(subject => ({
        subject,
        A: statsA.medias_disciplina[subject] || 0,
        B: statsB.medias_disciplina[subject] || 0,
        fullMark: 100
    }))

    // Preparar dados para o Diferencial (Bar Chart)
    const diffData = allSubjects.map(subject => ({
        subject,
        diferenca: (statsA.medias_disciplina[subject] || 0) - (statsB.medias_disciplina[subject] || 0)
    })).sort((a, b) => b.diferenca - a.diferenca)

    return (
        <div className="space-y-6">

            {/* Controles de Seleção */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5" />
                        Comparativo Direto
                    </CardTitle>
                    <CardDescription>Selecione duas turmas (ou a média da escola) para confrontar resultados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">

                        <div className="w-full md:w-1/3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                            <label className="text-sm font-bold text-primary mb-2 block">Turma A (Azul)</label>
                            <Select value={turmaA} onValueChange={setTurmaA}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Média da Escola</SelectItem>
                                    {Object.values(data.estatisticas_por_turma).map(t => (
                                        <SelectItem key={t.turma} value={t.turma}>{t.turma}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-4 text-center">
                                <div className="text-2xl font-bold">{statsA.taxa_aprovacao.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">Aprovação</div>
                            </div>
                        </div>

                        <div className="text-muted-foreground font-bold">VS</div>

                        <div className="w-full md:w-1/3 p-4 rounded-lg border-2 border-purple-500/20 bg-purple-500/5">
                            <label className="text-sm font-bold text-purple-600 mb-2 block">Turma B (Roxo)</label>
                            <Select value={turmaB} onValueChange={setTurmaB}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Média da Escola</SelectItem>
                                    {Object.values(data.estatisticas_por_turma).map(t => (
                                        <SelectItem key={t.turma} value={t.turma}>{t.turma}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-4 text-center">
                                <div className="text-2xl font-bold">{statsB.taxa_aprovacao.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">Aprovação</div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sobreposição de Médias</CardTitle>
                        <CardDescription>Comparativo de desempenho por disciplina</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name={statsA.turma} dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                                <Radar name={statsB.turma} dataKey="B" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Diferencial Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Diferencial de Performance</CardTitle>
                        <CardDescription>Onde a Turma A supera a Turma B (e vice-versa)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={diffData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[-20, 20]} />
                                <YAxis dataKey="subject" type="category" width={100} />
                                <Tooltip
                                    formatter={(value: number) => [value.toFixed(1), 'Diferença']}
                                    labelFormatter={(encoded) => `${encoded}`}
                                />
                                <ReferenceLine x={0} stroke="#000" />
                                <Bar dataKey="diferenca" fill="#8884d8" name="Diferença (A - B)">
                                    {diffData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.diferenca > 0 ? '#2563eb' : '#9333ea'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                <span>{statsA.turma} Melhor</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                                <span>{statsB.turma} Melhor</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}



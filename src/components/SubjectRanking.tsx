'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { Trophy } from 'lucide-react'

interface ClassStats {
    turma: string
    medias_disciplina: Record<string, number>
}

interface DashboardData {
    estatisticas_por_turma: Record<string, ClassStats>
    resumo_geral: {
        medias_gerais_disciplina: Record<string, number>
    }
}

interface SubjectRankingProps {
    data: DashboardData
}

export default function SubjectRanking({ data }: SubjectRankingProps) {
    const subjects = Object.keys(data.resumo_geral.medias_gerais_disciplina)
    const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0] || '')

    // Preparar dados do Ranking
    const rankingData = Object.values(data.estatisticas_por_turma).map(stat => ({
        turma: stat.turma,
        media: stat.medias_disciplina[selectedSubject] || 0
    })).sort((a, b) => b.media - a.media) // Ordenar da maior para menor média

    return (
        <Card className="mt-6 border-2 border-yellow-500/20">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-yellow-700">
                            <Trophy className="w-5 h-5" />
                            Ranking de Desempenho
                        </CardTitle>
                        <CardDescription>Classificação das turmas por média na disciplina</CardDescription>
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a Disciplina" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(sub => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={rankingData} layout="vertical" margin={{ left: 40, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 10]} hide />
                        <YAxis dataKey="turma" type="category" width={80} tick={{ fontSize: 14, fontWeight: 500 }} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: number) => [value.toFixed(1), 'Média']}
                        />
                        <Bar dataKey="media" name="Média" radius={[0, 4, 4, 0]} barSize={24}>
                            {rankingData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#3b82f6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* Leaderboard Textual */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rankingData.slice(0, 3).map((item, idx) => (
                        <div key={item.turma} className={`flex items-center gap-3 p-3 rounded-lg border ${idx === 0 ? 'bg-yellow-50 border-yellow-200' :
                                idx === 1 ? 'bg-slate-50 border-slate-200' :
                                    'bg-orange-50 border-orange-200'
                            }`}>
                            <div className={`font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-500 text-white' :
                                    idx === 1 ? 'bg-slate-400 text-white' :
                                        'bg-orange-700 text-white'
                                }`}>
                                {idx + 1}º
                            </div>
                            <div>
                                <div className="font-bold">{item.turma}</div>
                                <div className="text-sm text-muted-foreground">{item.media.toFixed(1)} pontos</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

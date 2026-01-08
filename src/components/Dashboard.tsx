'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  PieChart,
  FileText,
  Users,
  School,
  LogOut
} from 'lucide-react'
import Overview from '@/components/Overview'
import TurmaAnalysis from '@/components/TurmaAnalysis'
import Reports from '@/components/Reports'
import StudentsList from '@/components/StudentsList'

type MenuType = 'overview' | 'turma' | 'reports' | 'students'

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
  estatisticas_por_turma: Record<string, any>
  alunos: any[]
}

interface DashboardProps {
  initialData: DashboardData
}

export default function Dashboard({ initialData }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [activeMenu, setActiveMenu] = useState<MenuType>('overview')

  // Effect to update data if initialData changes (e.g. after re-fetch)
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const menuItems = [
    { id: 'overview' as MenuType, label: 'Visão Geral', icon: BarChart3 },
    { id: 'turma' as MenuType, label: 'Análise por Turma', icon: PieChart },
    { id: 'reports' as MenuType, label: 'Relatórios Detalhados', icon: FileText },
    { id: 'students' as MenuType, label: 'Lista de Alunos', icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-full h-20">
              <Image
                src="/logo.png"
                alt="Colégio Frei Ronaldo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Painel de Gestão</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start gap-2 ${activeMenu === item.id ? 'bg-primary/10 text-primary' : ''
                }`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {menuItems.find(item => item.id === activeMenu)?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.resumo_geral.total_alunos} alunos • {Object.keys(data.estatisticas_por_turma).length} turmas
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeMenu === 'overview' && <Overview data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'turma' && <TurmaAnalysis data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'reports' && <Reports data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'students' && <StudentsList data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
        </div>
      </main>
    </div>
  )
}

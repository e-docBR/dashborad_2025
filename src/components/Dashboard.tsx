'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  BarChart3,
  PieChart,
  FileText,
  Users,
  School,
  LogOut,
  AlertTriangle,
  ArrowRightLeft,
  Menu,
  Brain
} from 'lucide-react'
import Overview from '@/components/Overview'
import TurmaAnalysis from '@/components/TurmaAnalysis'
import Reports from '@/components/Reports'
import StudentsList from '@/components/StudentsList'
import RiskAnalysis from '@/components/RiskAnalysis'
import ComparativeAnalysis from '@/components/ComparativeAnalysis'

type MenuType = 'overview' | 'turma' | 'reports' | 'students' | 'risk' | 'comparative' | 'pedagogical'

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
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Effect to update data if initialData changes (e.g. after re-fetch)
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const menuItems = [
    { id: 'overview' as MenuType, label: 'Visão Geral', icon: BarChart3 },
    { id: 'turma' as MenuType, label: 'Análise por Turma', icon: PieChart },
    { id: 'risk' as MenuType, label: 'Risco Acadêmico', icon: AlertTriangle },
    { id: 'comparative' as MenuType, label: 'Comparativo', icon: ArrowRightLeft },
    { id: 'pedagogical' as MenuType, label: 'Insights Pedagógicos', icon: Brain },
    { id: 'reports' as MenuType, label: 'Relatórios Detalhados', icon: FileText },
    { id: 'students' as MenuType, label: 'Lista de Alunos', icon: Users },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full h-16 md:h-20">
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

      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start gap-2 min-h-11 touch-target ${activeMenu === item.id ? 'bg-primary/10 text-primary' : ''
              }`}
            onClick={() => {
              setActiveMenu(item.id)
              setIsMobileOpen(false)
            }}
          >
            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">{item.label}</span>
          </Button>
        ))}
      </nav>

      <div className="p-3 md:p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive min-h-11 touch-target">
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Sair</span>
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background no-overflow-x">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur px-3 md:px-6 flex items-center justify-between sticky top-0 z-10 safe-top">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden min-h-11 min-w-11 touch-target">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 safe-left safe-right">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate">
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h2>
              <p className="hidden md:block text-sm text-muted-foreground">
                {data.resumo_geral.total_alunos} alunos • {Object.keys(data.estatisticas_por_turma).length} turmas
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto w-full no-overflow-x">
          {activeMenu === 'overview' && <Overview data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'turma' && <TurmaAnalysis data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'risk' && <RiskAnalysis data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'comparative' && <ComparativeAnalysis data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'pedagogical' && (
            <div className="w-full">
              <a href="/pedagogical-insights" className="block w-full">
                <Button className="w-full min-h-12 touch-target">
                  <Brain className="mr-2 h-5 w-5" />
                  Acessar Insights Pedagógicos Completos
                </Button>
              </a>
            </div>
          )}
          {activeMenu === 'reports' && <Reports data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
          {activeMenu === 'students' && <StudentsList data={data} onMenuChange={(m: string) => setActiveMenu(m as MenuType)} />}
        </div>
      </main>
    </div>
  )
}

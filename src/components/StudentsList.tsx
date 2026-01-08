'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap,
  Award,
  XCircle,
  AlertCircle,
  ArrowRightLeft,
  LogOut,
  MinusCircle,
  AlertTriangle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Student {
  nome: string
  data_nascimento: string
  sexo: string
  turma: string
  turno: string
  notas: Record<string, number>
  media_geral: number | null
  resultado_final: string
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
  estatisticas_por_turma: Record<string, any>
  alunos: Student[]
}

interface StudentsListProps {
  data: DashboardData
  onMenuChange: (menu: string) => void
}

type SortField = 'nome' | 'turma' | 'media_geral' | 'resultado_final'
type SortOrder = 'asc' | 'desc'

export default function StudentsList({ data, onMenuChange }: StudentsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedTurno, setSelectedTurno] = useState<string>('all')
  const [selectedResultado, setSelectedResultado] = useState<string>('all')
  const [selectedSexo, setSelectedSexo] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const filteredStudents = useMemo(() => {
    let students = data.alunos

    // Filtro por termo de busca
    if (searchTerm) {
      students = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.turma.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por turma
    if (selectedTurma !== 'all') {
      students = students.filter(student => student.turma === selectedTurma)
    }

    // Filtro por turno
    if (selectedTurno !== 'all') {
      students = students.filter(student => student.turno === selectedTurno)
    }

    // Filtro por resultado
    if (selectedResultado !== 'all') {
      students = students.filter(student => student.resultado_final === selectedResultado)
    }

    // Filtro por sexo
    if (selectedSexo !== 'all') {
      students = students.filter(student => student.sexo === selectedSexo)
    }

    // Ordenação
    students.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome)
          break
        case 'turma':
          comparison = a.turma.localeCompare(b.turma)
          break
        case 'media_geral':
          const mediaA = a.media_geral || 0
          const mediaB = b.media_geral || 0
          comparison = mediaA - mediaB
          break
        case 'resultado_final':
          comparison = a.resultado_final.localeCompare(b.resultado_final)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return students
  }, [data.alunos, searchTerm, selectedTurma, selectedTurno, selectedResultado, selectedSexo, sortField, sortOrder])

  // Paginação
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Nome', 'Turma', 'Turno', 'Sexo', 'Média Geral', 'Resultado Final', ...Object.keys(data.resumo_geral.medias_gerais_disciplina)],
      ...filteredStudents.map(student => [
        student.nome,
        student.turma,
        student.turno,
        student.sexo === 'M' ? 'Masculino' : 'Feminino',
        student.media_geral?.toFixed(1) || '--',
        student.resultado_final,
        ...Object.keys(data.resumo_geral.medias_gerais_disciplina).map(disc =>
          student.notas[disc]?.toFixed(1) || '--'
        )
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-alunos-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'APROVADO':
        return <Award className="w-4 h-4 text-green-600" />
      case 'REPROVADO':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'APCC':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'TRANSFERIDO':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />
      case 'DESISTENTE':
        return <LogOut className="w-4 h-4 text-purple-600" />
      case 'CANCELADO':
        return <MinusCircle className="w-4 h-4 text-pink-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Lista de Alunos</CardTitle>
              <CardDescription>
                Mostrando {filteredStudents.length} de {data.alunos.length} alunos
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nome ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
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

              <div>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Resultado</label>
                <Select value={selectedResultado} onValueChange={setSelectedResultado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Resultados</SelectItem>
                    <SelectItem value="APROVADO">Aprovado</SelectItem>
                    <SelectItem value="REPROVADO">Reprovado</SelectItem>
                    <SelectItem value="APCC">APCC</SelectItem>
                    <SelectItem value="TRANSFERIDO">Transferido</SelectItem>
                    <SelectItem value="DESISTENTE">Desistente</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sexo</label>
                <Select value={selectedSexo} onValueChange={setSelectedSexo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Limpar Filtros */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedTurma('all')
                setSelectedTurno('all')
                setSelectedResultado('all')
                setSelectedSexo('all')
                setCurrentPage(1)
              }}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Filtros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
                <p className="text-xs text-muted-foreground">Total Filtrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredStudents.filter(s => s.resultado_final === 'APROVADO').length}
                </p>
                <p className="text-xs text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {filteredStudents.filter(s => s.resultado_final === 'REPROVADO').length}
                </p>
                <p className="text-xs text-muted-foreground">Reprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredStudents.filter(s => s.media_geral && s.media_geral >= 60).length}
                </p>
                <p className="text-xs text-muted-foreground">Média ≥ 60</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Relação de Alunos</CardTitle>
          <CardDescription>Página {currentPage} de {totalPages}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('nome')}
                  >
                    <div className="flex items-center gap-1">
                      Nome
                      {sortField === 'nome' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort('media_geral')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Média
                      {sortField === 'media_geral' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('resultado_final')}
                  >
                    <div className="flex items-center gap-1">
                      Resultado
                      {sortField === 'resultado_final' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{student.nome}</TableCell>
                    <TableCell>{student.turma}</TableCell>
                    <TableCell>
                      <Badge variant={student.turno === 'MATUTINO' ? 'default' : 'secondary'}>
                        {student.turno}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.sexo === 'M' ? 'Masculino' : 'Feminino'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={
                        student.media_geral && student.media_geral >= 60 ? 'text-green-600' :
                          student.media_geral && student.media_geral >= 50 ? 'text-yellow-600' :
                            student.media_geral ? 'text-red-600' : ''
                      }>
                        {student.media_geral ? student.media_geral.toFixed(1) : '--'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResultIcon(student.resultado_final)}
                        <Badge
                          variant={
                            student.resultado_final === 'APROVADO' ? 'default' :
                              student.resultado_final === 'REPROVADO' ? 'destructive' :
                                student.resultado_final === 'APCC' ? 'secondary' :
                                  'outline'
                          }
                        >
                          {student.resultado_final}
                        </Badge>
                        {student.media_geral && student.media_geral < 60 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-orange-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Média abaixo de 60. Risco identificado.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum aluno encontrado com os filtros selecionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredStudents.length)} de {filteredStudents.length} alunos
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Primeira
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Última
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

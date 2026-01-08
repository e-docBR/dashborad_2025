'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, FileType, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { importSchoolData } from '@/app/actions/import-data'
import { toast } from 'sonner'

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true)
        setResult(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const resp = await importSchoolData(formData)
            setResult(resp)
            if (resp.success) {
                toast.success(resp.message)
            } else {
                toast.error(resp.message)
            }
        } catch (error) {
            setResult({ success: false, message: 'Erro de conexão ou servidor.' })
            toast.error('Ocorreu um erro inesperado.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Importar Dados Escolares
                    </CardTitle>
                    <CardDescription>
                        Faça upload de arquivos PDF (boletins) ou planilhas Excel para atualizar o banco de dados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                            type="file"
                            accept=".pdf,.xlsx,.xls"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Formatos aceitos: .pdf, .xlsx
                        </p>
                    </div>

                    {file && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
                            <FileType className="w-4 h-4 text-blue-500" />
                            <span className="truncate flex-1">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(0)} KB
                            </span>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Iniciar Importação'
                        )}
                    </Button>

                    {result && (
                        <div className={`p-3 rounded-md flex items-start gap-2 text-sm ${result.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {result.success ? (
                                <CheckCircle className="w-5 h-5 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 shrink-0" />
                            )}
                            <p>{result.message}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Voltar para o <a href="/" className="underline hover:text-primary">Dashboard</a></p>
            </div>
        </div>
    )
}

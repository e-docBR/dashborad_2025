'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { chatWithData } from '@/app/actions/ai-chat'
import { cn } from '@/lib/utils'

interface Message {
    role: 'user' | 'assistant'
    content: string
    id: string
}

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Olá! Sou seu assistente de dados escolares. Como posso ajudar hoje?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        const response = await chatWithData(userMsg.content)

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.success ? response.text : "Desculpe, tive um erro ao processar."
        }

        setMessages(prev => [...prev, botMsg])
        setIsLoading(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <MessageCircle className="h-8 w-8" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] shadow-2xl border-indigo-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 bg-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Assistente IA
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-indigo-700 h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[400px] p-4 overflow-y-auto" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((m) => (
                                    <div key={m.id} className={cn(
                                        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                        m.role === 'user'
                                            ? "ml-auto bg-indigo-600 text-white"
                                            : "bg-muted text-foreground"
                                    )}>
                                        {m.content}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">
                                        Digitando...
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-3 bg-muted/20">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Pergunte sobre os alunos..."
                                className="flex-1 focus-visible:ring-indigo-500"
                            />
                            <Button type="submit" size="icon" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}

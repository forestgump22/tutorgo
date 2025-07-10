"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Trash2 } from "lucide-react"
import type { Message } from "@/types/chat"
import { useHandleChatResponse } from "@/hooks/useHandleChatResponse"

interface ChatContextType {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Hook para usar el contexto del chat
export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

// Proveedor del contexto del chat
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessagesState] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Cargar mensajes desde localStorage al inicializar
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages")
    const savedIsOpen = localStorage.getItem("chat-is-open")

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessagesState(parsedMessages)
      } catch (error) {
        console.error("Error loading saved messages:", error)
      }
    }

    if (savedIsOpen) {
      setIsOpen(savedIsOpen === "true")
    }
  }, [])

  // Función para actualizar mensajes y guardar en localStorage
  const setMessages = (newMessages: Message[]) => {
    setMessagesState(newMessages)
    localStorage.setItem("chat-messages", JSON.stringify(newMessages))
  }

  // Guardar estado de apertura en localStorage
  const setIsOpenWithPersistence = (open: boolean) => {
    setIsOpen(open)
    localStorage.setItem("chat-is-open", open.toString())
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        isOpen,
        setIsOpen: setIsOpenWithPersistence,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

// Componente del chat flotante
export default function FloatingChat() {
  const { messages, setMessages, isOpen, setIsOpen } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const { handleResponse } = useHandleChatResponse()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      text: input.trim(),
      timestamp: Date.now(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chats: newMessages.map((msg) => ({ role: msg.role, text: msg.text })) }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      
      if (handleResponse(data.response).skip){
        setIsLoading(false)
        return
      }

      const modelMessage: Message = {
        role: "model",
        text: data.response,
        timestamp: Date.now(),
      }
      setMessages([...newMessages, modelMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "model",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    if (showClearConfirm) {
      setMessages([])
      localStorage.removeItem("chat-messages")
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {messages.length > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {messages.length > 99 ? "99+" : messages.length}
          </div>
        )}
      </Button>

      {/* Chat Box */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 min-h-96 h-auto shadow-2xl z-40 flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">AI Chat</CardTitle>
            {messages.length > 0 && (
              <Button
                variant={showClearConfirm ? "destructive" : "ghost"}
                size="sm"
                onClick={clearChat}
                className="text-xs flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                {showClearConfirm ? "Confirm?" : "Clear"}
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 max-h-64">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  Start a conversation with AI
                  <br />
                  <span className="text-xs">Messages are saved automatically</span>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.role === "user"
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-sm text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  type="text"
                  autoComplete="off"
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}

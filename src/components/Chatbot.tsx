'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Bot, Sparkles, AlertTriangle, CornerDownLeft, RotateCcw, Flame, Waves, Heart, FileText } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
  toolCall?: {
    name: string
    args: any
  }
}

const QUICK_ACTIONS = [
  { label: 'CPR Guide', query: 'Show me step-by-step instructions for performing CPR.', icon: 'heart' },
  { label: 'Fire Escape', query: 'What should I do to evacuate safely during a fire?', icon: 'flame' },
  { label: 'Flood Safety', query: 'What are the safety steps for severe flooding?', icon: 'waves' },
  { label: 'How to Report', query: 'How do I submit an emergency report on BayaniLink?', icon: 'file' },
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize with a welcome message
  const initWelcomeMessage = () => {
    setMessages([
      {
        role: 'model',
        text: `Mabalos! I am the **Ligao City Emergency AI Assistant**. 

I can guide you on **first aid steps**, **disaster safety protocols**, and **how to submit emergency reports** in this app.

*If you are facing an immediate life-threatening emergency, please click the red **Quick Dial** button on the bottom-right or dial **911** immediately.*`
      }
    ])
    setErrorMsg(null)
  }

  useEffect(() => {
    initWelcomeMessage()
  }, [])

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input field when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // Auto-grow textarea based on input text height
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto'
      chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`
    }
  }, [input])

  // Close on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close chatbot if mobile navigation drawer is open (checking body.menu-open)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('menu-open')) {
        setIsOpen(false)
      }
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = { role: 'user', text: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setErrorMsg(null)

    // Reset height of textarea to default
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          // Exclude welcome message from history to keep context clean
          history: messages.slice(1),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get a response from the server.')
      }

      if (data.type === 'function_call') {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'model', 
            text: data.response, 
            toolCall: { name: data.functionName, args: data.functionArgs } 
          }
        ])
      } else {
        setMessages((prev) => [...prev, { role: 'model', text: data.response }])
      }
    } catch (err: any) {
      console.error('Chat error:', err)
      setErrorMsg(err.message || 'Connection lost. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle typing inside textarea (Enter sends, Shift+Enter newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  const handleResetChat = () => {
    if (window.confirm('Are you sure you want to reset this chat session?')) {
      initWelcomeMessage()
    }
  }

  // Action chips icon renderer
  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <Heart size={14} className="text-red-600 dark:text-red-400 shrink-0" />
      case 'flame':
        return <Flame size={14} className="text-orange-600 dark:text-orange-400 shrink-0" />
      case 'waves':
        return <Waves size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
      case 'file':
        return <FileText size={14} className="text-gray-600 dark:text-gray-400 shrink-0" />
      default:
        return null
    }
  }

  // Semantic Block-based Markdown Formatter: groups consecutive lists under <ul> and parses bold + italic tokens
  const formatMessageText = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let currentListItems: React.ReactNode[] = []

    const flushList = (key: string | number) => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 mb-2.5 space-y-1">
            {currentListItems}
          </ul>
        )
        currentListItems = []
      }
    }

    // Parses inline **bold** and *italic* tokens robustly
    const parseFormatting = (inputText: string) => {
      // 1. Split by bold tokens first
      const parts = inputText.split('**')
      
      return parts.map((part, index) => {
        // Even indices are normal text (which might contain italics)
        // Odd indices are bold text
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-bold text-gray-900 dark:text-white">
              {part}
            </strong>
          )
        } else {
          // 2. Process italics within normal text
          const italicParts = part.split('*')
          return italicParts.map((iPart, iIndex) => {
            if (iIndex % 2 === 1) {
              return (
                <em key={`${index}-${iIndex}`} className="italic text-gray-800 dark:text-gray-200">
                  {iPart}
                </em>
              )
            }
            return iPart
          })
        }
      })
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) {
        flushList(index)
        return
      }

      // Check if line is a bullet point (must have a space after the -, *, or •)
      const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)/)
      const isBullet = !!bulletMatch
      const rawContent = bulletMatch ? bulletMatch[3] : line
      const lineContent = parseFormatting(rawContent)

      if (isBullet) {
        currentListItems.push(
          <li key={`li-${index}`} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {lineContent}
          </li>
        )
      } else {
        flushList(index)
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed mb-2.5 text-gray-700 dark:text-gray-300 last:mb-0">
            {lineContent}
          </p>
        )
      }
    })

    flushList('final')
    return elements
  }

  return (
    <>
      {/* Backdrop (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Action Button (FAB) - Bottom Left */}
      <div id="chatbot-fab-btn" className="fixed bottom-4 left-4 z-50 flex items-center transition-all duration-300">
        {/* Pulsing ring indicator (always active to guide users under stress) */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-red-500/25 dark:bg-red-400/25 animate-ping-slow pointer-events-none" />
        )}
        <button
          onClick={() => setIsOpen((open) => !open)}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg border transition-all duration-300 active:scale-95
            ${isOpen
              ? 'bg-slate-900 border-red-500/35 text-white hover:bg-slate-800 dark:bg-slate-950 dark:border-red-900/50 dark:hover:bg-slate-900 rotate-90'
              : 'bg-gradient-to-r from-red-600 to-red-700 border-red-700/30 text-white hover:from-red-500 hover:to-red-600 shadow-red-600/20'}`}
          aria-label="Toggle emergency assistant chatbot"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Bot size={26} />}
        </button>
      </div>

      {/* Chat Window Panel */}
      <div
        className={`fixed bottom-20 left-4 z-50 flex flex-col rounded-2xl border bg-white/90 shadow-2xl shadow-slate-950/15 transition-all duration-300 ease-out origin-bottom-left dark:bg-slate-950/85 backdrop-blur-xl
          ${isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-6 scale-95 opacity-0 pointer-events-none'}
          border-slate-200/70 dark:border-slate-800/60
          w-[calc(100vw-2rem)] md:w-96 
          h-[calc(100vh-7rem)] md:h-[480px] max-h-[560px]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-red-500/30 bg-slate-950 px-4 py-3.5 text-white dark:border-red-900/40">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <Bot size={18} />
              {/* Online pulse dot */}
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">LIGAO EMERGENCY AI</h3>
              <p className="text-[10px] text-green-300 flex items-center gap-1 font-semibold">
                <Sparkles size={8} /> Active Response Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
          {/* Quick Action Suggestion Chips (only display when conversation is empty/just started) */}
          {messages.length <= 1 && (
            <div className="my-1 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Common Questions</span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSendMessage(action.query)}
                    className="flex items-center gap-2 text-left px-3 py-2.5 text-xs font-semibold rounded-xl bg-gray-50 border border-gray-200/70 text-gray-700 hover:bg-red-50/50 hover:border-red-200 hover:text-red-700 active:scale-97 transition-all dark:bg-gray-800/40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-red-950/20 dark:hover:border-red-900/40 dark:hover:text-red-300 cursor-pointer"
                  >
                    {renderActionIcon(action.icon)}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message History */}
          <div className="flex flex-col gap-3">
            {/* Inline Restart Conversation Button inside log */}
            {messages.length > 1 && (
              <div className="flex justify-center mb-1 animate-modal-in">
                <button
                  onClick={handleResetChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border border-red-200 text-red-600 bg-red-50/30 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer dark:border-red-900/40 dark:text-red-400 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                >
                  <RotateCcw size={12} />
                  <span>Restart Conversation</span>
                </button>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-modal-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs
                      ${isUser
                        ? 'bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-br-md dark:from-gray-100 dark:to-white dark:text-slate-950 border border-slate-800/20 dark:border-gray-200/10'
                        : 'bg-slate-100/80 text-slate-800 rounded-bl-md dark:bg-slate-800/80 dark:text-slate-200 border border-slate-200/40 dark:border-slate-800/30'}`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed text-white dark:text-slate-950">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {formatMessageText(msg.text)}
                        {msg.toolCall?.name === 'draftEmergencyReport' && (
                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
                            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                              <FileText size={14} />
                              Draft Emergency Report
                            </div>
                            <div className="mb-3 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                              <p><span className="font-semibold">Category:</span> {msg.toolCall.args.category}</p>
                              <p><span className="font-semibold">Description:</span> {msg.toolCall.args.description}</p>
                              <p><span className="font-semibold">Location:</span> {msg.toolCall.args.barangay || 'Not specified (will ask for GPS)'}</p>
                            </div>
                            <button
                              onClick={() => {
                                const params = new URLSearchParams()
                                if (msg.toolCall?.args.category) params.set('category', msg.toolCall.args.category)
                                if (msg.toolCall?.args.description) params.set('description', msg.toolCall.args.description)
                                if (msg.toolCall?.args.barangay) params.set('barangay', msg.toolCall.args.barangay)
                                window.location.href = `/report?${params.toString()}`
                              }}
                              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-95 shadow-md shadow-red-600/20"
                            >
                              📝 Auto-Fill Reporting Form
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing Loader State */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3.5 dark:bg-gray-800/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></span>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {errorMsg && (
              <div className="flex flex-col gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 animate-modal-in">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span>Connection Error</span>
                </div>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                <button
                  onClick={() => handleSendMessage(messages[messages.length - 1]?.text || '')}
                  className="mt-1 text-left text-[11px] font-bold text-red-600 hover:text-red-700 underline dark:text-red-300 cursor-pointer"
                >
                  Retry request
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <div className="border-t border-slate-200/50 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-b-2xl">
          <div className="flex items-end gap-2 rounded-xl bg-white border border-slate-200/80 px-3 py-2 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/25 transition-all dark:bg-slate-950 dark:border-slate-800 dark:focus-within:border-red-600 dark:focus-within:ring-red-600/25">
            <textarea
              ref={chatInputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for first aid guidance..."
              className="flex-1 max-h-24 min-h-[20px] resize-none overflow-y-auto bg-transparent py-0.5 text-sm focus:outline-hidden text-gray-800 dark:text-gray-100"
              disabled={isLoading}
            />
            <div className="flex items-center gap-1.5">
              {input.trim() && (
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  Send <CornerDownLeft size={10} />
                </span>
              )}
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer
                  ${input.trim() && !isLoading
                    ? 'bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-sm shadow-red-600/10'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'}`}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[9px] text-gray-400 leading-none">
              AI recommendations are not a replacement for professional emergency services.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

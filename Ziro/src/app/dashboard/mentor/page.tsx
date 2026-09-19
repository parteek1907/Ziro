"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIMentorPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: 'assistant',
      content: "Hello! I'm your Ziro AI Financial Mentor. Based on your recent dashboard activity, I notice you have $42,504.80 in your vault. How can I help you optimize your portfolio today?"
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "That's a great question. Looking at your L2 settlement history and current TrustScore of 740, I'd recommend allocating about 20% of your idle stablecoins into our yield-generating secure vaults. Would you like me to draft a quick allocation plan?"
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-white text-3xl font-bold tracking-tight mb-2">AI Mentor</h1>
        <p className="text-[#8B8F98]">Chat with your personalized financial intelligence model.</p>
      </div>

      <div className="flex-1 bg-[#111114] border border-white/5 rounded-[24px] flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2161E8]/5 to-transparent pointer-events-none"></div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {messages.map(msg => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-tr from-[#2161E8] to-[#00E5FF] p-[2px]' 
                    : 'bg-white/10'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="w-full h-full rounded-full bg-[#0B0B0D] flex items-center justify-center font-bold text-sm text-white">JD</div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-[#2161E8] text-white rounded-tr-sm' 
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-2 h-2 rounded-full bg-white/50"></motion.div>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-2 h-2 rounded-full bg-white/50"></motion.div>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-2 h-2 rounded-full bg-white/50"></motion.div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-white/5 bg-[#111114] relative z-10">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for investment advice, risk analysis, or portfolio review..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#2161E8] transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#2161E8] rounded-lg flex items-center justify-center text-white hover:bg-[#1a4bba] transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[#8B8F98] text-[10px] uppercase tracking-widest font-bold">AI responses may be inaccurate. Verify important financial decisions.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

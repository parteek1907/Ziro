"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConsultantStore } from "@/store/useConsultantStore"
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Send, CheckCircle2, ArrowLeft } from "lucide-react"

export default function ConsultationRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { consultations, consultants, updateConsultationStatus } = useConsultantStore()
  
  const consultation = consultations.find(c => c.id === resolvedParams.id)
  const consultant = consultation ? consultants.find(co => co.id === consultation.consultantId) : null

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'system', text: 'Waiting for consultant to join...' }
  ])
  const [chatInput, setChatInput] = useState("")

  useEffect(() => {
    if (consultation && consultation.status === "Upcoming") {
      updateConsultationStatus(consultation.id, "In session")
      
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'consultant', text: `Hi there! I've reviewed your issue regarding "${consultation.topic}". Let's go through it step by step.` }])
      }, 3000)
    }
  }, [consultation])

  if (!consultation || !consultant) return <div className="p-12 text-center">Consultation not found</div>

  const handleEndSession = () => {
    updateConsultationStatus(consultation.id, "Completed")
    router.push("/dashboard/consultants/my-consultations")
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { sender: 'user', text: chatInput }])
    setChatInput("")
  }

  return (
    <div className="w-full h-[calc(100vh-2rem)] p-4 flex flex-col gap-4">
      <Link href="/dashboard/consultants/my-consultations" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium ml-4 transition-colors">
        <ArrowLeft size={16} /> Leave Room
      </Link>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* ── Left Panel: Video Room ─────────────────────────────── */}
        <div className="flex-1 bg-slate-900 rounded-[32px] overflow-hidden flex flex-col relative shadow-xl border border-white/20">
          {/* Main Video Area */}
          <div className="flex-1 relative flex items-center justify-center">
            {isVideoOn ? (
              <div className="w-full h-full relative">
                <img src={consultant.avatar} alt="Consultant" className="w-full h-full object-cover opacity-60 blur-sm" />
                <div className="absolute inset-0 bg-slate-900/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-slate-700">
                    <img src={consultant.avatar} alt="Consultant" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-white font-bold text-2xl">{consultant.name}</h3>
                  <p className="text-slate-300 font-medium">Verified Consultant</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 font-medium flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl font-bold text-slate-600">
                  {consultant.name.charAt(0)}
                </div>
                Camera Disabled
              </div>
            )}

            {/* Self View (Picture in Picture) */}
            <div className="absolute bottom-6 right-6 w-48 h-32 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg">
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium text-sm">
                You
              </div>
            </div>

            {/* Top Bar */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Session Active
              </div>
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-mono text-sm">
                {consultation.duration}:00
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-24 bg-black/50 backdrop-blur-xl flex items-center justify-center gap-4 px-6 border-t border-white/10">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            >
              {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors">
              <MonitorUp size={20} />
            </button>
            <button 
              onClick={handleEndSession}
              className="px-6 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 transition-colors ml-4 shadow-lg shadow-red-500/20"
            >
              <PhoneOff size={18} /> End Session
            </button>
          </div>
        </div>

        {/* ── Right Panel: Chat & Info ─────────────────────────── */}
        <div className="w-full lg:w-[400px] bg-white/60 backdrop-blur-md rounded-[32px] border border-white/50 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white">
            <h2 className="font-bold text-slate-800 text-lg mb-1">Session Details</h2>
            <p className="text-slate-500 text-sm font-medium">{consultation.topic}</p>
          </div>

          {/* Notes/Context */}
          <div className="p-6 border-b border-white bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Issue Description</h3>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm leading-relaxed">
              "{consultation.description}"
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : m.sender === 'system' ? 'items-center' : 'items-start'}`}>
                {m.sender === 'system' ? (
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{m.text}</span>
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${m.sender === 'user' ? 'bg-[#4a72ff] text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                    {m.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white/50 border-t border-white flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-white border border-slate-200 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a72ff]/30 text-slate-700"
            />
            <button 
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="w-10 h-10 rounded-full bg-[#4a72ff] hover:bg-[#3b5bdb] disabled:bg-slate-300 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={16} className="ml-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

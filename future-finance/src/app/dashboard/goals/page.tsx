"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type Goal = {
  id: string
  name: string
  target: number
  current: number
  color: string
}

export default function GoalTrackerPage() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", name: "Emergency Fund", target: 10000, current: 8500, color: "bg-[#35E58A]" },
    { id: "2", name: "L2 Yield Portfolio", target: 50000, current: 12400, color: "bg-[#2161E8]" },
    { id: "3", name: "Vacation", target: 5000, current: 1200, color: "bg-[#00E5FF]" }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoalName, setNewGoalName] = useState("")
  const [newGoalTarget, setNewGoalTarget] = useState("")

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalName || !newGoalTarget) return

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName,
      target: parseFloat(newGoalTarget),
      current: 0,
      color: "bg-white" // default color for new goals
    }

    setGoals([...goals, newGoal])
    setNewGoalName("")
    setNewGoalTarget("")
    setIsModalOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Goal Tracker</h1>
          <p className="text-[#8B8F98]">Set financial targets and automate your L2 savings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2161E8] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#1a4bba] transition-colors flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const progress = Math.min(100, Math.max(0, (goal.current / goal.target) * 100))
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={goal.id} 
              className="bg-[#111114] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-white font-bold text-xl tracking-tight">{goal.name}</h3>
                <button className="text-white/30 hover:text-white transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className="text-white text-2xl font-bold">${goal.current.toLocaleString()}</div>
                    <div className="text-[#8B8F98] text-xs uppercase tracking-widest font-bold mt-1">of ${goal.target.toLocaleString()}</div>
                  </div>
                  <div className="text-white text-lg font-bold">{progress.toFixed(0)}%</div>
                </div>

                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                    className={`h-full ${goal.color} rounded-full`}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Create Goal Modal (Simple overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111114] border border-white/10 rounded-[24px] p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-bold">Create New Goal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8B8F98] hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase mb-2 block">Goal Name</label>
                <input 
                  type="text" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. New Car" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-[#8B8F98] text-xs font-bold tracking-widest uppercase mb-2 block">Target Amount ($)</label>
                <input 
                  type="number" 
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="10000" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#2161E8] transition-colors"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-[#2161E8] text-white font-bold text-base rounded-xl px-4 py-3.5 hover:bg-[#1a4bba] transition-colors mt-6">
                Save Goal
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
